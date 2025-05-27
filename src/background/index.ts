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
    // FOOD API
    if (message.type === "FETCH_FOOD_DATA") {
        const payload = message.payload;
        console.log("[voim][background] FETCH_FOOD_DATA 요청 수신됨:", payload);

        fetch("https://voim.store/api/v1/products/foods", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })
            .then((res) => res.json())
            .then((data) => {
                logger.debug("FOOD API 응답 성공:", data);
                if (sender.tab?.id) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        type: "FOOD_DATA_RESPONSE",
                        data,
                    });
                }
                sendResponse({ status: 200, data });
            })
            .catch((err) => {
                console.error(
                    "[voim][background] FOOD API 요청 실패:",
                    err.message,
                );
                if (sender.tab?.id) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        type: "FOOD_DATA_ERROR",
                        error: err.message,
                    });
                }
                sendResponse({ status: 500, error: err.message });
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

        fetch(`https://voim.store/api/v1/products/analysis/${outline}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ html }),
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
            .then((res) => res.json())
            .then((data) => {
                if (sender.tab?.id) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        type: "COSMETIC_DATA_RESPONSE",
                        data: data.data,
                    });
                }
                sendResponse({
                    type: "COSMETIC_DATA_RESPONSE",
                    data: data.data,
                });
            })
            .catch((err) => {
                console.error("COSMETIC 요청 실패:", err);
                if (sender.tab?.id) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        type: "COSMETIC_DATA_ERROR",
                        error: err.message,
                    });
                }
                sendResponse({
                    type: "COSMETIC_DATA_ERROR",
                    error: err.message,
                });
            });

        return true;
    }

    // REVIEW SUMMARY API
    if (message.type === "FETCH_REVIEW_SUMMARY") {
        const { productId, reviewRating, reviews } = message.payload;

        fetch("https://voim.store/api/v1/review/summary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, reviewRating, reviews }),
        })
            .then((res) => res.json())
            .then((data) => {
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
                console.error("REVIEW SUMMARY 오류:", err);
                if (sender.tab?.id) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        type: "REVIEW_SUMMARY_ERROR",
                        error: err.message,
                    });
                }
                sendResponse({
                    type: "REVIEW_SUMMARY_ERROR",
                    error: err.message,
                });
            });

        return true;
    }

    // HEALTH DATA API
    if (message.type === "FETCH_HEALTH_DATA") {
        const { productId, title, html, birthYear, gender, allergies } =
            message.payload;

        console.log("[health api] Request payload:", {
            productId,
            title,
            html,
            birthYear,
            gender,
            allergies,
        });

        fetch("https://voim.store/api/v1/health-food/keywords", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                productId,
                title,
                html,
                birthYear,
                gender,
                allergies: allergies || [],
            }),
        })
            .then((res) => {
                console.log("[health api] Response status:", res.status);
                return res.json();
            })
            .then((data) => {
                console.log("[health api] Response data:", data);
                if (sender.tab?.id) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        type: "HEALTH_DATA_RESPONSE",
                        data: data.data,
                    });
                }
                sendResponse({ type: "HEALTH_DATA_RESPONSE", data: data.data });
            })
            .catch((err) => {
                console.error("[health api] Request failed:", err);
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

chrome.action.onClicked.addListener(async (tab) => {
    try {
        logger.debug("툴바 아이콘 클릭됨");
        await handleModalToggle();
    } catch (error) {
        logger.error("툴바 아이콘 클릭 처리 중 오류 발생:", error);
    }
});
