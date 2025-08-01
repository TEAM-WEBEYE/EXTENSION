import { logger } from "@src/utils/logger";
import { IFRAME_CONSTANTS } from "../constants";

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

type IframeState = {
    isVisible: boolean;
    hiddenByAltA: boolean;
    hiddenByAltV: boolean;
};

/**
 * iframe 관련 서비스 (싱글턴)
 * 모든 iframe 생성, 제거, 상태 관리를 중앙에서 처리합니다.
 */
class IframeService {
    private static instance: IframeService;
    private isInitialized: boolean = false;

    private constructor() {
        // private constructor to prevent direct instantiation
    }

    /**
     * 싱글턴 인스턴스를 반환합니다.
     */
    public static getInstance(): IframeService {
        if (!IframeService.instance) {
            IframeService.instance = new IframeService();
        }
        return IframeService.instance;
    }

    /**
     * 서비스를 초기화합니다.
     */
    public async initialize(): Promise<void> {
        if (this.isInitialized) {
            logger.debug("IframeService가 이미 초기화되었습니다.");
            return;
        }

        try {
            logger.debug("IframeService 초기화 시작");
            this.isInitialized = true;
            logger.debug("IframeService 초기화 완료");
        } catch (error) {
            logger.error("IframeService 초기화 중 오류:", error);
            throw error;
        }
    }

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
     * iframe 토글 스크립트를 실행합니다.
     */
    private async executeToggleScript(
        tabId: number,
        action: "TOGGLE" | "TOGGLE_MODAL" | "TOGGLE_SIDEBAR" | "TOGGLE_STYLE",
        wasHiddenByAltV?: boolean,
    ): Promise<void> {
        await chrome.scripting.executeScript({
            target: { tabId },
            func: (
                iframeId: string,
                defaultStyles: Record<string, string>,
                expandedStyles: Record<string, string>,
                actionStr: string,
                wasHiddenByAltVBool: boolean,
            ) => {
                try {
                    const existingIframe = document.getElementById(
                        iframeId,
                    ) as HTMLIFrameElement;

                    // 스토리지 상태를 먼저 확인
                    chrome.storage.local.get(
                        [
                            "iframeInvisible",
                            "iframeHiddenByAltA",
                            "iframeHiddenByAltV",
                        ],
                        (result) => {
                            const isInvisible = result.iframeInvisible ?? false;
                            const hiddenByAltA =
                                result.iframeHiddenByAltA ?? false;
                            const hiddenByAltV =
                                result.iframeHiddenByAltV ?? false;

                            // ALT+A로 숨겨진 경우 처리
                            if (
                                actionStr === "TOGGLE_STYLE" &&
                                wasHiddenByAltVBool &&
                                !existingIframe
                            ) {
                                chrome.storage.local.set({
                                    iframeInvisible: true,
                                    iframeHiddenByAltA: true,
                                    iframeHiddenByAltV: false,
                                });
                                return;
                            }

                            // iframe이 존재하면 제거
                            if (existingIframe) {
                                existingIframe.remove();
                                chrome.storage.local.set({
                                    iframeInvisible: true,
                                    iframeHiddenByAltA:
                                        actionStr === "TOGGLE_STYLE",
                                    iframeHiddenByAltV:
                                        actionStr === "TOGGLE" ||
                                        actionStr === "TOGGLE_MODAL" ||
                                        actionStr === "TOGGLE_SIDEBAR",
                                });
                                return;
                            }

                            // iframe이 없고 숨겨진 상태일 때만 생성
                            if (isInvisible) {
                                // ALT+A로 숨겨진 경우에는 iframe을 생성하지 않음
                                if (hiddenByAltA) {
                                    return;
                                }

                                // iframe 생성
                                const iframe = document.createElement("iframe");
                                iframe.id = iframeId;
                                iframe.src =
                                    chrome.runtime.getURL("iframe.html");
                                iframe.setAttribute("tabindex", "1");

                                // 스타일 설정
                                Object.entries(defaultStyles).forEach(
                                    ([key, value]) => {
                                        iframe.style[key as any] = value;
                                    },
                                );

                                // 메시지 핸들러 설정
                                const handleMessage = function (
                                    event: MessageEvent,
                                ) {
                                    if (event.source !== iframe.contentWindow)
                                        return;

                                    if (event.data.type === "RESIZE_IFRAME") {
                                        const newStyles = event.data.isOpen
                                            ? {
                                                  ...defaultStyles,
                                                  ...expandedStyles,
                                              }
                                            : defaultStyles;

                                        Object.entries(newStyles).forEach(
                                            ([key, value]) => {
                                                iframe.style[key as any] =
                                                    value;
                                            },
                                        );
                                    }
                                };

                                window.addEventListener(
                                    "message",
                                    handleMessage,
                                );
                                document.body.appendChild(iframe);

                                // 상태 저장
                                chrome.storage.local.set({
                                    iframeInvisible: false,
                                    iframeHiddenByAltA: false,
                                    iframeHiddenByAltV: false,
                                });

                                // iframe 로드 후 액션 실행
                                iframe.onload = function () {
                                    if (iframe.contentWindow) {
                                        iframe.contentWindow.postMessage(
                                            { type: actionStr },
                                            "*",
                                        );
                                    }
                                };
                            }
                        },
                    );
                } catch (error) {
                    console.error("iframe 토글 중 오류:", error);
                    throw error;
                }
            },
            args: [
                IFRAME_CONSTANTS.ID,
                IFRAME_CONSTANTS.STYLES.DEFAULT,
                IFRAME_CONSTANTS.STYLES.EXPANDED,
                action,
                wasHiddenByAltV ?? false,
            ],
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
            await this.executeToggleScript(tabs[0].id, "TOGGLE");
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

            await this.executeToggleScript(tabs[0].id, "TOGGLE_MODAL");
            logger.debug("모달 토글 메시지 전송 완료");
        } catch (error) {
            logger.error("모달 토글 메시지 전송 중 오류:", error);
            throw error;
        }
    }

    /**
     * 현재 활성화된 탭에 사이드바를 토글하는 메시지를 보냅니다.
     */
    async toggleSidebarInActiveTab(): Promise<void> {
        try {
            const tabs = await chrome.tabs.query({
                active: true,
                currentWindow: true,
            });

            if (!tabs?.[0]?.id) {
                logger.error("활성화된 탭을 찾을 수 없거나 탭 ID가 없습니다");
                return;
            }

            await this.executeToggleScript(tabs[0].id, "TOGGLE_SIDEBAR");
            logger.debug("사이드바 토글 메시지 전송 완료");
        } catch (error) {
            logger.error("사이드바 토글 메시지 전송 중 오류:", error);
            throw error;
        }
    }

    /**
     * 현재 활성화된 탭에 스타일 토글을 실행합니다.
     */
    async toggleStyleInActiveTab(wasHiddenByAltV: boolean): Promise<void> {
        try {
            const tabs = await chrome.tabs.query({
                active: true,
                currentWindow: true,
            });

            if (!tabs?.[0]?.id) {
                logger.error("활성화된 탭을 찾을 수 없거나 탭 ID가 없습니다");
                return;
            }

            await this.executeToggleScript(
                tabs[0].id,
                "TOGGLE_STYLE",
                wasHiddenByAltV,
            );
            logger.debug("스타일 토글 메시지 전송 완료");
        } catch (error) {
            logger.error("스타일 토글 메시지 전송 중 오류:", error);
            throw error;
        }
    }

    /**
     * iframe 상태를 가져옵니다.
     */
    async getIframeState(): Promise<IframeState> {
        return new Promise((resolve) => {
            chrome.storage.local.get(
                ["iframeInvisible", "iframeHiddenByAltA", "iframeHiddenByAltV"],
                (result) => {
                    resolve({
                        isVisible: !(result.iframeInvisible ?? false),
                        hiddenByAltA: result.iframeHiddenByAltA ?? false,
                        hiddenByAltV: result.iframeHiddenByAltV ?? false,
                    });
                },
            );
        });
    }

    /**
     * iframe 상태를 설정합니다.
     */
    async setIframeState(state: Partial<IframeState>): Promise<void> {
        const updates: Record<string, any> = {};

        if (state.isVisible !== undefined) {
            updates.iframeInvisible = !state.isVisible;
        }
        if (state.hiddenByAltA !== undefined) {
            updates.iframeHiddenByAltA = state.hiddenByAltA;
        }
        if (state.hiddenByAltV !== undefined) {
            updates.iframeHiddenByAltV = state.hiddenByAltV;
        }

        await chrome.storage.local.set(updates);
    }

    /**
     * 서비스의 초기화 상태를 확인합니다.
     */
    public isReady(): boolean {
        return this.isInitialized;
    }

    /**
     * 서비스를 정리합니다.
     */
    public async cleanup(): Promise<void> {
        try {
            logger.debug("IframeService 정리 시작");
            this.isInitialized = false;
            logger.debug("IframeService 정리 완료");
        } catch (error) {
            logger.error("IframeService 정리 중 오류:", error);
            throw error;
        }
    }
}

// 싱글턴 인스턴스 내보내기
export const iframeService = IframeService.getInstance();
