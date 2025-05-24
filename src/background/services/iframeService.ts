import { logger } from "@src/utils/logger";

type IframeStyle = {
    position: string;
    top: string;
    right: string;
    width: string;
    height: string;
    border: string;
    background: string;
    zIndex: string;
};

const IFRAME_CONSTANTS = {
    ID: "floating-button-extension-iframe",
    STYLES: {
        DEFAULT: {
            position: "fixed",
            top: "70px",
            right: "20px",
            width: "65px",
            height: "65px",
            border: "none",
            background: "transparent",
            zIndex: "2147483647",
        } as IframeStyle,
        EXPANDED: {
            width: "100%",
            height: "100%",
            top: "0",
            right: "0",
        } as Partial<IframeStyle>,
    },
} as const;

/**
 * iframe 관련 서비스
 */
class IframeService {
    /**
     * iframe의 스타일을 설정합니다.
     */
    private setIframeStyles(
        iframe: HTMLIFrameElement,
        isExpanded: boolean = false,
    ): void {
        const styles = isExpanded
            ? {
                  ...IFRAME_CONSTANTS.STYLES.DEFAULT,
                  ...IFRAME_CONSTANTS.STYLES.EXPANDED,
              }
            : IFRAME_CONSTANTS.STYLES.DEFAULT;

        Object.entries(styles).forEach(([key, value]) => {
            iframe.style[key as keyof IframeStyle] = value;
        });
    }

    /**
     * iframe의 메시지 핸들러를 설정합니다.
     */
    private setupMessageHandler(iframe: HTMLIFrameElement): void {
        const handleMessage = (event: MessageEvent) => {
            if (event.source !== iframe.contentWindow) return;

            if (event.data.type === "RESIZE_IFRAME") {
                this.setIframeStyles(iframe, event.data.isOpen);
            }
        };

        window.addEventListener("message", handleMessage);
    }

    /**
     * iframe을 생성하고 설정합니다.
     */
    private createIframe(iframeId: string): HTMLIFrameElement {
        const iframe = document.createElement("iframe");
        iframe.id = iframeId;
        iframe.src = chrome.runtime.getURL("iframe.html");
        this.setIframeStyles(iframe);
        return iframe;
    }

    /**
     * iframe 토글 스크립트를 실행합니다.
     */
    private async executeToggleScript(tabId: number): Promise<void> {
        await chrome.scripting.executeScript({
            target: { tabId },
            func: (
                iframeId: string,
                styles: typeof IFRAME_CONSTANTS.STYLES,
            ) => {
                try {
                    console.log("iframe 토글 시작");

                    const existingIframe = document.getElementById(iframeId);
                    if (existingIframe) {
                        console.log("기존 iframe 제거");
                        existingIframe.remove();
                        return;
                    }

                    console.log("새 iframe 생성");
                    const iframe = document.createElement("iframe");
                    iframe.id = iframeId;
                    iframe.src = chrome.runtime.getURL("iframe.html");

                    // 스타일 설정
                    Object.entries(styles.DEFAULT).forEach(([key, value]) => {
                        iframe.style[key as any] = value;
                    });

                    document.body.appendChild(iframe);

                    // 메시지 핸들러 설정
                    window.addEventListener("message", function (event) {
                        if (event.source !== iframe.contentWindow) return;

                        if (event.data.type === "RESIZE_IFRAME") {
                            const newStyles = event.data.isOpen
                                ? { ...styles.DEFAULT, ...styles.EXPANDED }
                                : styles.DEFAULT;

                            Object.entries(newStyles).forEach(
                                ([key, value]) => {
                                    iframe.style[key as any] = value;
                                },
                            );
                        }
                    });

                    console.log("iframe 추가 완료");
                } catch (error) {
                    console.error("iframe 토글 중 오류:", error);
                    throw error;
                }
            },
            args: [IFRAME_CONSTANTS.ID, IFRAME_CONSTANTS.STYLES],
        });
    }

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

            if (!tabs?.[0]?.id) {
                logger.error("활성화된 탭을 찾을 수 없거나 탭 ID가 없습니다");
                return;
            }

            logger.debug(`탭 ID ${tabs[0].id}에 스크립트 주입 시도`);
            await this.executeToggleScript(tabs[0].id);
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

            if (!tabs?.[0]?.id) {
                logger.error("활성화된 탭을 찾을 수 없거나 탭 ID가 없습니다");
                return;
            }

            await chrome.tabs.sendMessage(tabs[0].id, {
                action: "TOGGLE_MODAL",
            });
            logger.debug("모달 토글 메시지 전송 완료");
        } catch (error) {
            logger.error("모달 토글 메시지 전송 중 오류:", error);
            throw error;
        }
    }
}

export const iframeService = new IframeService();
