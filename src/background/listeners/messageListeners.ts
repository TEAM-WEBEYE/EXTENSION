import { logger } from "@src/utils/logger";
import { ALLOWED_FONT_MESSAGES } from "../constants";
import { settingsService } from "../services/settingsService";
import { handleIframeMessage } from "./iframeCommandHandler";
import { handleStyleMessage } from "./styleCommandHandler";

/**
 * 메시지 리스너 초기화
 */
export function initMessageListeners(): void {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (ALLOWED_FONT_MESSAGES.includes(message.type)) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]?.id) {
                    chrome.tabs.sendMessage(tabs[0].id, message, (res) => {
                        sendResponse(res);
                    });
                } else {
                    sendResponse({ success: false, error: "탭 없음" });
                }
            });
            return true;
        }

        if (message.type === "RESET_SETTINGS") {
            settingsService
                .resetAllSettings()
                .then(() => {
                    sendResponse({ success: true });
                })
                .catch((error) => {
                    logger.error("설정 초기화 중 오류:", error);
                    sendResponse({ success: false, error: error.message });
                });

            return true;
        }

        if (message.type === "SET_IFRAME_VISIBLE") {
            handleIframeMessage(message.visible)
                .then(() => {
                    sendResponse({ success: true });
                })
                .catch((error) => {
                    logger.error("iframe 표시 상태 변경 중 오류:", error);
                    sendResponse({ success: false, error: error.message });
                });

            return true;
        }

        if (message.type === "SET_STYLES_ENABLED") {
            handleStyleMessage(message.enabled)
                .then(() => {
                    sendResponse({ success: true });
                })
                .catch((error) => {
                    logger.error("스타일 상태 변경 중 오류:", error);
                    sendResponse({ success: false, error: error.message });
                });

            return true;
        }

        return false;
    });
}
