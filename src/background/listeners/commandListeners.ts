import { logger } from "@src/utils/logger";
import { cursorService } from "../services/cursorService";
import { iframeService } from "../services/iframeService";
import { settingsService } from "../services/settingsService";

/**
 * 명령어 리스너 초기화
 */
export function initCommandListeners(): void {
    chrome.commands.onCommand.addListener(async (command) => {
        logger.debug(`명령어 수신: ${command}`);

        try {
            if (command === "toggle_iframe") {
                logger.debug("toggle_iframe 명령어 처리 중");
                try {
                    const tabs = await chrome.tabs.query({
                        active: true,
                        currentWindow: true,
                    });
                    if (tabs[0]?.id) {
                        await chrome.scripting.executeScript({
                            target: { tabId: tabs[0].id },
                            func: function () {
                                try {
                                    console.log("iframe 토글 직접 실행");
                                    const iframeId =
                                        "floating-button-extension-iframe";
                                    const existingIframe =
                                        document.getElementById(iframeId);

                                    if (existingIframe) {
                                        existingIframe.remove();
                                        return;
                                    }

                                    const iframe =
                                        document.createElement("iframe");
                                    iframe.id = iframeId;
                                    iframe.src =
                                        chrome.runtime.getURL("iframe.html");

                                    iframe.style.position = "fixed";
                                    iframe.style.top = "70px";
                                    iframe.style.right = "20px";
                                    iframe.style.width = "65px";
                                    iframe.style.height = "65px";
                                    iframe.style.border = "none";
                                    iframe.style.background = "transparent";
                                    iframe.style.zIndex = "2147483647";

                                    document.body.appendChild(iframe);

                                    console.log("iframe 생성 완료");
                                } catch (err) {
                                    console.error("iframe 토글 오류:", err);
                                }
                            },
                        });
                        logger.debug("iframe 토글 스크립트 실행 완료");
                    }
                } catch (error) {
                    logger.error("직접 스크립트 실행 중 오류:", error);

                    await iframeService.toggleIframeInActiveTab();
                }
            } else if (command === "toggle-modal") {
                await iframeService.toggleModalInActiveTab();
            } else if (command === "toggle-cursor") {
                await cursorService.toggleCursor();
            } else if (command === "toggle-all-features") {
                const tabs = await chrome.tabs.query({
                    active: true,
                    currentWindow: true,
                });

                if (tabs[0]?.id) {
                    await settingsService.toggleAllStyles(tabs[0].id);
                }
            }
        } catch (error) {
            logger.error(`명령어 처리 중 오류 (${command}):`, error);
        }
    });
}
