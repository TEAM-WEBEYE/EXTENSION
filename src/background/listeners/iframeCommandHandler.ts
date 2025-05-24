import { logger } from "@src/utils/logger";
import { iframeService } from "../services/iframeService";

export async function handleIframeToggle(): Promise<void> {
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
                        const iframeId = "floating-button-extension-iframe";
                        const existingIframe =
                            document.getElementById(iframeId);

                        // 현재 iframeInvisible 상태 확인
                        chrome.storage.local.get(
                            ["iframeInvisible", "iframeHiddenByAltA"],
                            (result) => {
                                const isInvisible =
                                    result.iframeInvisible ?? false;

                                if (existingIframe) {
                                    // iframe이 있으면 제거하고 상태를 true로 설정
                                    existingIframe.remove();
                                    chrome.storage.local.set(
                                        {
                                            iframeInvisible: true,
                                            iframeHiddenByAltA: false,
                                        },
                                        () => {
                                            console.log(
                                                "iframe 숨김 상태로 변경됨 (ALT + V)",
                                            );
                                        },
                                    );
                                } else {
                                    // iframe이 없으면 생성하고 상태를 false로 설정
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
                                    chrome.storage.local.set(
                                        {
                                            iframeInvisible: false,
                                            iframeHiddenByAltA: false,
                                        },
                                        () => {
                                            console.log(
                                                "iframe 보임 상태로 변경됨",
                                            );
                                        },
                                    );
                                }
                            },
                        );
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
}
