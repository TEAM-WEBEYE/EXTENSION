import { cursorService } from "../services/cursorService";

/**
 * 탭 관련 리스너 초기화
 */
export function initTabListeners(): void {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (
            changeInfo.status === "complete" &&
            tab.url &&
            tab.url.startsWith("http")
        ) {
            cursorService.updateCursorForTab(tabId);
        }
    });
}
