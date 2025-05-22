import { initMessageListeners } from "./listeners/messageListeners";
import { initStorageListeners } from "./listeners/storageListeners";
import { initTabListeners } from "./listeners/tabListeners";
import { storageService } from "./services/storageService";
import { logger } from "@src/utils/logger";
import { STORAGE_KEYS } from "./constants";
import { initCommandListeners } from "./listeners/commandListeners";
import { cursorService } from "./services/cursorService";

/**
 * 백그라운드 스크립트 초기화
 */
async function init() {
    try {
        logger.debug("백그라운드 스크립트 초기화 시작");

        initCommandListeners();
        initMessageListeners();
        initStorageListeners();
        initTabListeners();

        logger.debug("모든 리스너가 초기화되었습니다");

        const result = await chrome.storage.sync.get([
            STORAGE_KEYS.CURSOR_THEME,
            STORAGE_KEYS.CURSOR_SIZE,
            STORAGE_KEYS.IS_CURSOR_ENABLED,
        ]);

        if (result[STORAGE_KEYS.CURSOR_THEME]) {
            cursorService.setCursorTheme(result[STORAGE_KEYS.CURSOR_THEME]);
        }

        if (result[STORAGE_KEYS.CURSOR_SIZE]) {
            cursorService.setCursorSize(result[STORAGE_KEYS.CURSOR_SIZE]);
        }

        if (result[STORAGE_KEYS.IS_CURSOR_ENABLED] !== undefined) {
            cursorService.setCursorEnabled(
                result[STORAGE_KEYS.IS_CURSOR_ENABLED],
            );
        }

        await cursorService.updateAllTabs();

        chrome.commands.getAll().then((commands) => {
            logger.debug("사용 가능한 명령어:", commands);
        });
    } catch (error) {
        logger.error("백그라운드 스크립트 초기화 오류:", error);
    }
}

init();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
            .then((res) => {
                console.log(
                    "[voim][background] FOOD API 응답 상태코드:",
                    res.status,
                );
                return res.json();
            })
            .then((data) => {
                console.log("[voim][background] FOOD API 응답 성공:", data);

                if (sender.tab?.id) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        type: "FOOD_DATA_RESPONSE",
                        data,
                    });
                }
                sendResponse({
                    status: 200,
                    data,
                });
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

                sendResponse({
                    status: 500,
                    error: err.message,
                });
            });

        return true;
    }

    if (message.type === "FETCH_IMAGE_ANALYSIS") {
        const imageUrl = message.payload?.url;

        fetch("https://voim.store/api/v1/image-analysis", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: imageUrl }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("백그라운드 API 응답:", data);
                console.log("보낼 data.data:", data.data);

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
    if (message.type === "FETCH_OUTLINE_INFO") {
        const { outline, html } = message.payload;
        console.log(
            "[voim][background] FETCH_OUTLINE_INFO 요청 수신:",
            outline,
        );

        fetch(`https://voim.store/api/v1/products/analysis/${outline}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ html }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(
                    "[voim][background] OUTLINE INFO 응답 데이터:",
                    data,
                );
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
                console.error("[voim][background] OUTLINE INFO 오류:", err);

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
    if (message.type === "FETCH_COSMETIC_DATA") {
        const { productId, html } = message.payload;
        console.log(
            "[voim][background] FETCH_COSMETIC_DATA 요청 수신:",
            productId,
        );

        fetch(`https://voim.store/api/v1/cosmetic`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ productId, html }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("[voim][background] COSMETIC 응답 성공:", data);
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
                console.error("[voim][background] COSMETIC 요청 실패:", err);
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
});
