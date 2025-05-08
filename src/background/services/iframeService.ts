import { logger } from "@src/utils/logger";
import { standaloneToggleIframe } from "./toggleIframeFuncs";

/**
 * iframe 관련 서비스
 */
class IframeService {
    /**
     * 현재 활성화된 탭에 iframe을 토글합니다.
     */
    async toggleIframeInActiveTab(): Promise<void> {
        logger.debug("toggleIframeInActiveTab 호출됨");
        try {
            const tabs = await chrome.tabs.query({
                active: true,
                currentWindow: true,
            });

            if (!tabs || tabs.length === 0) {
                logger.error("활성화된 탭을 찾을 수 없습니다");
                return;
            }

            if (!tabs[0]?.id) {
                logger.error("탭 ID가 없습니다");
                return;
            }

            logger.debug(`탭 ID ${tabs[0].id}에 스크립트 주입 시도`);

            // 간단한 함수로 iframe 토글 시도
            await chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: function () {
                    try {
                        console.log("간단한 iframe 토글 시작");

                        const iframeId = "floating-button-extension-iframe";
                        const existingIframe =
                            document.getElementById(iframeId);

                        if (existingIframe) {
                            console.log("기존 iframe 제거");
                            existingIframe.remove();
                            return;
                        }

                        console.log("새 iframe 생성");
                        const iframe = document.createElement("iframe");
                        iframe.id = iframeId;
                        iframe.src = chrome.runtime.getURL("iframe.html");

                        iframe.style.position = "fixed";
                        iframe.style.top = "70px";
                        iframe.style.right = "20px";
                        iframe.style.width = "65px";
                        iframe.style.height = "65px";
                        iframe.style.border = "none";
                        iframe.style.background = "transparent";
                        iframe.style.zIndex = "2147483647";

                        document.body.appendChild(iframe);

                        // 메시지 이벤트 추가
                        window.addEventListener("message", function (event) {
                            if (event.source !== iframe.contentWindow) return;

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
                        });

                        console.log("iframe 추가 완료");
                    } catch (error) {
                        console.error("iframe 토글 중 오류:", error);
                    }
                },
            });

            logger.debug("스크립트 성공적으로 주입됨");
        } catch (error) {
            logger.error("iframe 토글 중 오류:", error);
            throw error;
        }
    }

    /**
     * 현재 활성화된 탭에 모달을 토글하는 메시지를 보냅니다.
     */
    async toggleModalInActiveTab(): Promise<void> {
        try {
            const tabs = await chrome.tabs.query({
                active: true,
                currentWindow: true,
            });

            if (tabs[0]?.id) {
                await chrome.tabs.sendMessage(tabs[0].id, {
                    action: "TOGGLE_MODAL",
                });
                logger.debug("모달 토글 메시지 전송 완료");
            }
        } catch (error) {
            logger.error("모달 토글 메시지 전송 중 오류:", error);
            throw error;
        }
    }
}

export const iframeService = new IframeService();
