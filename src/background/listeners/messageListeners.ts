import { logger } from "@src/utils/logger";
import { ALLOWED_FONT_MESSAGES } from "../constants";
import { cursorService } from "../services/cursorService";
import { settingsService } from "../services/settingsService";

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

        if (message.type === "GET_CURSOR_SETTINGS") {
            const cursorUrl = cursorService.isCursorActive()
                ? cursorService.getCurrentCursorUrl()
                : null;

            sendResponse({
                isCursorEnabled: cursorService.isCursorActive(),
                cursorUrl: cursorUrl,
            });
            return true;
        }

        return false;
    });
}
