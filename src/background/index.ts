import { initMessageListeners } from "./listeners/messageListeners";
import { initStorageListeners } from "./listeners/storageListeners";
import { logger } from "@src/utils/logger";
import {
    STORAGE_KEYS,
    DEFAULT_THEME,
    DEFAULT_FONT_SIZE,
    DEFAULT_FONT_WEIGHT,
} from "./constants";
import { initCommandListeners } from "./listeners/commandListeners";
import { handleModalToggle } from "./listeners/modalCommandHandler";
import { handleIconToggle } from "./listeners/iconHandler";

/**
 * 백그라운드 스크립트 초기화
 */
async function init() {
    try {
        logger.debug("백그라운드 스크립트 초기화 시작");

        initCommandListeners();
        initMessageListeners();
        initStorageListeners();

        logger.debug("모든 리스너가 초기화되었습니다");

        chrome.commands.getAll().then((commands) => {
            logger.debug("사용 가능한 명령어:", commands);
        });
    } catch (error) {
        logger.error("백그라운드 스크립트 초기화 오류:", error);
    }
}

init();

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        const defaultSettings = {
            [STORAGE_KEYS.THEME_MODE]: DEFAULT_THEME,
            [STORAGE_KEYS.FONT_SIZE]: DEFAULT_FONT_SIZE,
            [STORAGE_KEYS.FONT_WEIGHT]: DEFAULT_FONT_WEIGHT,
        };
        chrome.storage.local.set(defaultSettings, () => {
            logger.debug(
                "확장 프로그램 설치됨: 스토리지에 기본 설정 저장 완료",
            );
        });

        chrome.storage.local.set({ iframeInvisible: false }, () => {
            logger.debug("iframe 기본 설정 저장 완료");
        });
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "PAGE_TYPE") {
        // iframe으로 메시지 전달
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            if (activeTab?.id) {
                chrome.tabs.sendMessage(
                    activeTab.id,
                    {
                        type: "PAGE_TYPE",
                        value: message.value,
                    },
                    (response) => {
                        sendResponse(response);
                    },
                );
            }
        });
        return true; // 비동기 응답을 위해 true 반환
    }

    if (message.type === "CART_PAGE") {
        // iframe으로 메시지 전달
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            if (activeTab?.id) {
                chrome.tabs.sendMessage(
                    activeTab.id,
                    {
                        type: "CART_PAGE",
                        value: message.value,
                    },
                    (response) => {
                        sendResponse(response);
                    },
                );
            }
        });
        return true; // 비동기 응답을 위해 true 반환
    }

    if (message.type === "CART_ITEMS_UPDATED") {
        // 장바구니 아이템 정보를 저장
        chrome.storage.local.set({ cartItems: message.data }, () => {
            // 현재 활성화된 탭에만 업데이트된 장바구니 정보 전달
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const activeTab = tabs[0];
                if (activeTab?.id) {
                    chrome.tabs
                        .sendMessage(activeTab.id, {
                            type: "CART_ITEMS_UPDATED",
                            data: message.data,
                        })
                        .catch(() => {
                            // 메시지 전송 실패 시 무시
                        });
                }
            });
        });
    }

    // FOOD API
    if (message.type === "FETCH_FOOD_DATA") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            if (!activeTab?.url) {
                sendResponse({
                    status: 400,
                    error: "상품 페이지를 찾을 수 없습니다.",
                });
                return;
            }

            const productId = activeTab.url.match(/vp\/products\/(\d+)/)?.[1];
            if (!productId) {
                sendResponse({
                    status: 400,
                    error: "상품 ID를 찾을 수 없습니다.",
                });
                return;
            }

            const payload = {
                ...message.payload,
                productId,
            };

            fetch("https://voim.store/api/v1/products/foods", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            }).then(async (res) => {
                const text = await res.text();

                try {
                    const json = JSON.parse(text);
                    if (res.ok) {
                        sendResponse({ status: 200, data: json });
                    } else {
                        sendResponse({
                            status: res.status,
                            error: json?.message ?? "에러 발생",
                        });
                    }
                } catch (err) {
                    console.error("[voim] JSON 파싱 실패", text);
                    sendResponse({
                        status: res.status,
                        error: "JSON 파싱 실패",
                    });
                }
            });
        });

        return true;
    }

    // IMAGE ANALYSIS API
    if (message.type === "FETCH_IMAGE_ANALYSIS") {
        const imageUrl = message.payload?.url;

        fetch("https://voim.store/api/v1/image-analysis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: imageUrl }),
        })
            .then((res) => res.json())
            .then((data) => {
                logger.debug("이미지 분석 API 응답:", data);
                if (sender.tab?.id) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        type: "IMAGE_ANALYSIS_RESPONSE",
                        data: data.data,
                    });
                }
                sendResponse({
                    type: "IMAGE_ANALYSIS_RESPONSE",
                    data: data.data,
                });
            })
            .catch((err) => {
                console.error("이미지 분석 에러:", err);
                if (sender.tab?.id) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        type: "IMAGE_ANALYSIS_ERROR",
                        error: err.message,
                    });
                }
                sendResponse({
                    type: "IMAGE_ANALYSIS_ERROR",
                    error: err.message,
                });
            });

        return true;
    }

    // OUTLINE INFO API
    if (message.type === "FETCH_OUTLINE_INFO") {
        const { outline, html } = message.payload;

        // 현재 활성화된 탭의 URL에서 productId 추출
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            if (!activeTab?.url) {
                sendResponse({
                    type: "OUTLINE_INFO_ERROR",
                    error: "상품 페이지를 찾을 수 없습니다.",
                });
                return;
            }

            const productId = activeTab.url.match(/vp\/products\/(\d+)/)?.[1];
            if (!productId) {
                sendResponse({
                    type: "OUTLINE_INFO_ERROR",
                    error: "상품 ID를 찾을 수 없습니다.",
                });
                return;
            }

            fetch(`https://voim.store/api/v1/product-detail/${outline}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ html, productId }),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (sender.tab?.id) {
                        chrome.tabs.sendMessage(sender.tab.id, {
                            type: "OUTLINE_INFO_RESPONSE",
                            data: data.data,
                        });
                    }
                    sendResponse({
                        type: "OUTLINE_INFO_RESPONSE",
                        data: data.data,
                    });
                })
                .catch((err) => {
                    console.error("OUTLINE INFO 오류:", err);
                    if (sender.tab?.id) {
                        chrome.tabs.sendMessage(sender.tab.id, {
                            type: "OUTLINE_INFO_ERROR",
                            error: err.message,
                        });
                    }
                    sendResponse({
                        type: "OUTLINE_INFO_ERROR",
                        error: err.message,
                    });
                });
        });

        return true;
    }

    // COSMETIC API
    if (message.type === "FETCH_COSMETIC_DATA") {
        const { productId, html } = message.payload;

        fetch("https://voim.store/api/v1/cosmetic", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, html }),
        })
            .then(async (res) => {
                const json = await res.json();

                return json;
            })
            .then((data) => {
                const raw = data?.data;

                if (!raw || typeof raw !== "object") {
                    console.warn(
                        "[voim][background] data.data 형식 이상함:",
                        raw,
                    );
                    sendResponse({
                        type: "COSMETIC_DATA_ERROR",
                        error: "API 응답 형식 오류",
                    });
                    return;
                }

                sendResponse({
                    type: "COSMETIC_DATA_RESPONSE",
                    data: raw,
                });

                if (sender.tab?.id) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        type: "COSMETIC_DATA_RESPONSE",
                        data: raw,
                    });
                }
            })
            .catch((err) => {
                console.error("[voim][background] COSMETIC 요청 실패:", err);
                sendResponse({
                    type: "COSMETIC_DATA_ERROR",
                    error: err.message,
                });

                if (sender.tab?.id) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        type: "COSMETIC_DATA_ERROR",
                        error: err.message,
                    });
                }
            });

        return true;
    }

    // // REVIEW SUMMARY API
    if (message.type === "FETCH_REVIEW_SUMMARY") {
        const { productId, reviewRating, reviews } = message.payload;

        fetch("https://voim.store/api/v1/review/summary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, reviewRating, reviews }),
        })
            .then(async (res) => {
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(
                        errorData.message ||
                            `HTTP error! status: ${res.status}`,
                    );
                }
                return res.json();
            })
            .then((data) => {
                if (!data.data) {
                    throw new Error("서버 응답에 데이터가 없습니다.");
                }

                if (sender.tab?.id) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        type: "REVIEW_SUMMARY_RESPONSE",
                        data: data.data,
                    });
                }
                sendResponse({
                    type: "REVIEW_SUMMARY_RESPONSE",
                    data: data.data,
                });
            })
            .catch((err) => {
                console.error("[voim] REVIEW SUMMARY 오류:", err);
                const errorMessage =
                    err.message || "리뷰 요약 처리 중 오류가 발생했습니다";

                if (sender.tab?.id) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        type: "REVIEW_SUMMARY_ERROR",
                        error: errorMessage,
                    });
                }
                sendResponse({
                    type: "REVIEW_SUMMARY_ERROR",
                    error: errorMessage,
                });
            });

        return true;
    }

    // HEALTH DATA API
    if (message.type === "FETCH_HEALTH_DATA") {
        const { productId, title, html, birthYear, gender, allergies } =
            message.payload;

        fetch("https://voim.store/api/v1/health-food/keywords", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                productId,
                title,
                html,
                birthYear,
                gender,
                allergies,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (sender.tab?.id) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        type: "HEALTH_DATA_RESPONSE",
                        data: data.data,
                    });
                }
                sendResponse({ type: "HEALTH_DATA_RESPONSE", data: data.data });
            })
            .catch((err) => {
                console.error("HEALTH 요청 실패:", err);
                if (sender.tab?.id) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        type: "HEALTH_DATA_ERROR",
                        error: err.message,
                    });
                }
                sendResponse({ type: "HEALTH_DATA_ERROR", error: err.message });
            });

        return true;
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "FETCH_VENDOR_HTML") {
        if (sender.tab?.id) {
            chrome.tabs.sendMessage(
                sender.tab.id,
                { type: "GET_VENDOR_HTML" },
                (response) => {
                    sendResponse(response);
                },
            );
            return true;
        }
    }
});

chrome.action.onClicked.addListener(async (tab) => {
    try {
        logger.debug("툴바 아이콘 클릭됨");
        await handleIconToggle();
    } catch (error) {
        logger.error("툴바 아이콘 클릭 처리 중 오류 발생:", error);
    }
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_PRODUCT_TITLE") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tabId = tabs[0]?.id;
            if (!tabId) {
                sendResponse({ title: "" });
                return;
            }

            chrome.tabs.sendMessage(
                tabId,
                { type: "GET_PRODUCT_TITLE" },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.error(
                            "[voim][background] title 요청 실패:",
                            chrome.runtime.lastError.message,
                        );
                        sendResponse({ title: "" });
                    } else {
                        sendResponse(response);
                    }
                },
            );
        });

        return true;
    }

    return false;
});
