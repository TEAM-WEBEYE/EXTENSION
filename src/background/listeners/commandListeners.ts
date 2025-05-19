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

                                    const handleMessage = function (
                                        event: MessageEvent,
                                    ) {
                                        if (
                                            event.source !==
                                            iframe.contentWindow
                                        ) {
                                            return;
                                        }

                                        if (
                                            event.data.type === "RESIZE_IFRAME"
                                        ) {
                                            if (event.data.isOpen) {
                                                iframe.style.width = "100%";
                                                iframe.style.height = "100%";
                                                iframe.style.top = "0";
                                                iframe.style.right = "0";
                                            } else {
                                                iframe.style.width = "65px";
                                                iframe.style.height = "65px";
                                                iframe.style.top = "70px";
                                                iframe.style.right = "20px";
                                            }
                                        }
                                    };

                                    window.addEventListener(
                                        "message",
                                        handleMessage,
                                    );
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
                const tabs = await chrome.tabs.query({
                    active: true,
                    currentWindow: true,
                });
                if (tabs[0]?.id) {
                    await chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        func: function () {
                            const iframeId = "floating-button-extension-iframe";
                            let iframe = document.getElementById(
                                iframeId,
                            ) as HTMLIFrameElement;
                            let wasCreated = false;

                            function createIframe() {
                                const newIframe =
                                    document.createElement("iframe");
                                newIframe.id = iframeId;
                                newIframe.src =
                                    chrome.runtime.getURL("iframe.html");

                                newIframe.style.position = "fixed";
                                newIframe.style.top = "70px";
                                newIframe.style.right = "20px";
                                newIframe.style.width = "65px";
                                newIframe.style.height = "65px";
                                newIframe.style.border = "none";
                                newIframe.style.background = "transparent";
                                newIframe.style.zIndex = "2147483647";

                                return newIframe;
                            }

                            function setupResizeHandler(
                                iframe: HTMLIFrameElement,
                            ) {
                                const handleMessage = function (
                                    event: MessageEvent,
                                ) {
                                    if (event.source !== iframe.contentWindow)
                                        return;

                                    if (event.data.type === "RESIZE_IFRAME") {
                                        if (event.data.isOpen) {
                                            iframe.style.width = "100%";
                                            iframe.style.height = "100%";
                                            iframe.style.top = "0";
                                            iframe.style.right = "0";
                                        } else {
                                            iframe.style.width = "65px";
                                            iframe.style.height = "65px";
                                            iframe.style.top = "70px";
                                            iframe.style.right = "20px";
                                        }
                                    }
                                };

                                window.addEventListener(
                                    "message",
                                    handleMessage,
                                );
                            }

                            function setupModalCloseHandler(
                                iframe: HTMLIFrameElement,
                                wasCreated: boolean,
                            ) {
                                const modalCloseListener = function (
                                    event: MessageEvent,
                                ) {
                                    if (event.source !== iframe.contentWindow)
                                        return;

                                    if (
                                        event.data.type === "RESIZE_IFRAME" &&
                                        !event.data.isOpen &&
                                        wasCreated
                                    ) {
                                        iframe.remove();
                                        window.removeEventListener(
                                            "message",
                                            modalCloseListener,
                                        );
                                    }
                                };

                                window.addEventListener(
                                    "message",
                                    modalCloseListener,
                                );
                            }

                            function toggleModal(iframe: HTMLIFrameElement) {
                                if (iframe.contentWindow) {
                                    iframe.contentWindow.postMessage(
                                        { type: "TOGGLE_MODAL" },
                                        "*",
                                    );
                                }
                            }

                            if (!iframe) {
                                wasCreated = true;
                                iframe = createIframe();
                                setupResizeHandler(iframe);
                                document.body.appendChild(iframe);

                                iframe.onload = function () {
                                    toggleModal(iframe);
                                };
                            } else {
                                toggleModal(iframe);
                            }

                            setupModalCloseHandler(iframe, wasCreated);
                        },
                    });
                }
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
