import { logger } from "@src/utils/logger";
import { contentServiceManager } from "./ContentServiceManager";
import { SettingsService, StyleService } from "./types";

export interface ContentMessageHandler {
    type: string;
    handler: (
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ) => boolean | Promise<boolean>;
}

/**
 * Content Script용 메시지 서비스 (싱글턴)
 * Content script의 모든 메시지 처리를 중앙에서 관리합니다.
 */
class ContentMessageService {
    private static instance: ContentMessageService;
    private handlers: Map<string, ContentMessageHandler> = new Map();
    private isInitialized: boolean = false;

    private constructor() {
        // private constructor to prevent direct instantiation
    }

    /**
     * 싱글턴 인스턴스를 반환합니다.
     */
    public static getInstance(): ContentMessageService {
        if (!ContentMessageService.instance) {
            ContentMessageService.instance = new ContentMessageService();
        }
        return ContentMessageService.instance;
    }

    /**
     * 메시지 서비스를 초기화합니다.
     */
    public initialize(): void {
        if (this.isInitialized) {
            logger.debug("ContentMessageService가 이미 초기화되었습니다.");
            return;
        }

        try {
            logger.debug("ContentMessageService 초기화 시작");

            // 기본 메시지 핸들러 등록
            this.registerDefaultHandlers();

            // ContentServiceManager에 메시지 핸들러 등록
            this.handlers.forEach((handler, type) => {
                contentServiceManager.registerMessageHandler(
                    type,
                    handler.handler,
                );
            });

            this.isInitialized = true;
            logger.debug("ContentMessageService 초기화 완료");
        } catch (error) {
            logger.error("ContentMessageService 초기화 중 오류:", error);
            throw error;
        }
    }

    /**
     * 메시지 핸들러를 등록합니다.
     */
    public registerHandler(handler: ContentMessageHandler): void {
        this.handlers.set(handler.type, handler);
        logger.debug(`Content 메시지 핸들러 등록됨: ${handler.type}`);
    }

    /**
     * 등록된 핸들러를 제거합니다.
     */
    public unregisterHandler(type: string): void {
        this.handlers.delete(type);
        logger.debug(`Content 메시지 핸들러 제거됨: ${type}`);
    }

    /**
     * 기본 메시지 핸들러들을 등록합니다.
     */
    private registerDefaultHandlers(): void {
        // 스타일 관련 메시지들
        this.registerHandler({
            type: "APPLY_SETTINGS",
            handler: this.handleApplySettings.bind(this),
        });

        this.registerHandler({
            type: "DISABLE_ALL_STYLES",
            handler: this.handleDisableAllStyles.bind(this),
        });

        this.registerHandler({
            type: "RESTORE_ALL_STYLES",
            handler: this.handleRestoreAllStyles.bind(this),
        });

        this.registerHandler({
            type: "REMOVE_ALL_STYLE_SHEETS",
            handler: this.handleRemoveAllStyleSheets.bind(this),
        });

        this.registerHandler({
            type: "RESET_SETTINGS",
            handler: this.handleResetSettings.bind(this),
        });

        // 모드 관련 메시지들
        this.registerHandler({
            type: "SET_MODE_LIGHT",
            handler: this.handleSetModeLight.bind(this),
        });

        this.registerHandler({
            type: "SET_MODE_DARK",
            handler: this.handleSetModeDark.bind(this),
        });

        // 폰트 크기 관련 메시지들
        this.registerHandler({
            type: "SET_FONT_SIZE_XS",
            handler: this.handleSetFontSizeXS.bind(this),
        });

        this.registerHandler({
            type: "SET_FONT_SIZE_S",
            handler: this.handleSetFontSizeS.bind(this),
        });

        this.registerHandler({
            type: "SET_FONT_SIZE_M",
            handler: this.handleSetFontSizeM.bind(this),
        });

        this.registerHandler({
            type: "SET_FONT_SIZE_L",
            handler: this.handleSetFontSizeL.bind(this),
        });

        this.registerHandler({
            type: "SET_FONT_SIZE_XL",
            handler: this.handleSetFontSizeXL.bind(this),
        });

        // 폰트 굵기 관련 메시지들
        this.registerHandler({
            type: "SET_FONT_WEIGHT_REGULAR",
            handler: this.handleSetFontWeightRegular.bind(this),
        });

        this.registerHandler({
            type: "SET_FONT_WEIGHT_NORMAL",
            handler: this.handleSetFontWeightNormal.bind(this),
        });

        this.registerHandler({
            type: "SET_FONT_WEIGHT_BOLD",
            handler: this.handleSetFontWeightBold.bind(this),
        });

        this.registerHandler({
            type: "SET_FONT_WEIGHT_XBOLD",
            handler: this.handleSetFontWeightXBold.bind(this),
        });

        // 기타 메시지들
        this.registerHandler({
            type: "GET_PRODUCT_TITLE",
            handler: this.handleGetProductTitle.bind(this),
        });

        this.registerHandler({
            type: "GET_VENDOR_HTML",
            handler: this.handleGetVendorHtml.bind(this),
        });

        this.registerHandler({
            type: "CART_ITEMS_UPDATED",
            handler: this.handleCartItemsUpdated.bind(this),
        });
    }

    /**
     * 설정 적용 메시지 처리
     */
    private async handleApplySettings(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ): Promise<boolean> {
        try {
            logger.debug("설정 적용 메시지 처리:", message);

            // 즉시 응답을 보내고 비동기 작업을 별도로 처리
            sendResponse({ success: true });

            // 설정 서비스가 있다면 해당 서비스에 위임
            if (contentServiceManager.isReady()) {
                try {
                    const settingsService =
                        contentServiceManager.getService<SettingsService>(
                            "settings",
                        );
                    if (settingsService && settingsService.applySettings) {
                        await settingsService.applySettings(message.settings);
                    }
                } catch (error) {
                    logger.warn("설정 서비스를 찾을 수 없습니다:", error);
                }
            }

            return true;
        } catch (error) {
            logger.error("설정 적용 메시지 처리 중 오류:", error);
            return false;
        }
    }

    /**
     * 모든 스타일 비활성화 메시지 처리
     */
    private async handleDisableAllStyles(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ): Promise<boolean> {
        try {
            logger.debug("모든 스타일 비활성화 메시지 처리");

            // 즉시 응답을 보내고 비동기 작업을 별도로 처리
            sendResponse({ success: true });

            // 스타일 서비스가 있다면 해당 서비스에 위임
            if (contentServiceManager.isReady()) {
                try {
                    const styleService =
                        contentServiceManager.getService<StyleService>("style");
                    if (styleService && styleService.disableAllStyles) {
                        await styleService.disableAllStyles();
                    }
                } catch (error) {
                    logger.warn("스타일 서비스를 찾을 수 없습니다:", error);
                }
            }

            return true;
        } catch (error) {
            logger.error("스타일 비활성화 메시지 처리 중 오류:", error);
            // 오류가 발생해도 이미 응답을 보냈으므로 여기서는 로깅만
            return false;
        }
    }

    /**
     * 모든 스타일 복원 메시지 처리
     */
    private async handleRestoreAllStyles(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ): Promise<boolean> {
        try {
            logger.debug("모든 스타일 복원 메시지 처리:", message);

            // 즉시 응답을 보내고 비동기 작업을 별도로 처리
            sendResponse({ success: true });

            // 스타일 서비스가 있다면 해당 서비스에 위임
            if (contentServiceManager.isReady()) {
                try {
                    const styleService =
                        contentServiceManager.getService<StyleService>("style");
                    if (styleService && styleService.restoreAllStyles) {
                        await styleService.restoreAllStyles(message.settings);
                    }
                } catch (error) {
                    logger.warn("스타일 서비스를 찾을 수 없습니다:", error);
                }
            }

            return true;
        } catch (error) {
            logger.error("스타일 복원 메시지 처리 중 오류:", error);
            // 오류가 발생해도 이미 응답을 보냈으므로 여기서는 로깅만
            return false;
        }
    }

    /**
     * 모든 스타일시트 제거 메시지 처리
     */
    private async handleRemoveAllStyleSheets(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ): Promise<boolean> {
        try {
            logger.debug("모든 스타일시트 제거 메시지 처리");

            // 즉시 응답을 보내고 비동기 작업을 별도로 처리
            sendResponse({ success: true });

            // 스타일 서비스가 있다면 해당 서비스에 위임
            if (contentServiceManager.isReady()) {
                try {
                    const styleService =
                        contentServiceManager.getService<StyleService>("style");
                    if (styleService && styleService.disableAllStyles) {
                        await styleService.disableAllStyles();
                    }
                } catch (error) {
                    logger.warn("스타일 서비스를 찾을 수 없습니다:", error);
                }
            }

            return true;
        } catch (error) {
            logger.error("스타일시트 제거 메시지 처리 중 오류:", error);
            // 오류가 발생해도 이미 응답을 보냈으므로 여기서는 로깅만
            return false;
        }
    }

    /**
     * 설정 초기화 메시지 처리
     */
    private async handleResetSettings(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ): Promise<boolean> {
        try {
            logger.debug("설정 초기화 메시지 처리");

            // 즉시 응답을 보내고 비동기 작업을 별도로 처리
            sendResponse({ success: true });

            // 설정 서비스가 있다면 해당 서비스에 위임
            if (contentServiceManager.isReady()) {
                try {
                    const settingsService =
                        contentServiceManager.getService<SettingsService>(
                            "settings",
                        );
                    if (settingsService && settingsService.resetSettings) {
                        await settingsService.resetSettings();
                    }
                } catch (error) {
                    logger.warn("설정 서비스를 찾을 수 없습니다:", error);
                }
            }

            return true;
        } catch (error) {
            logger.error("설정 초기화 메시지 처리 중 오류:", error);
            return false;
        }
    }

    /**
     * 라이트 모드 설정 메시지 처리
     */
    private async handleSetModeLight(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ): Promise<boolean> {
        try {
            logger.debug("라이트 모드 설정 메시지 처리");

            // 즉시 응답을 보내고 비동기 작업을 별도로 처리
            sendResponse({ success: true });

            // 스타일 서비스가 있다면 해당 서비스에 위임
            if (contentServiceManager.isReady()) {
                try {
                    const styleService =
                        contentServiceManager.getService<StyleService>("style");
                    if (styleService && styleService.setMode) {
                        await styleService.setMode("light");
                    }
                } catch (error) {
                    logger.warn("스타일 서비스를 찾을 수 없습니다:", error);
                }
            }

            return true;
        } catch (error) {
            logger.error("라이트 모드 설정 메시지 처리 중 오류:", error);
            return false;
        }
    }

    /**
     * 다크 모드 설정 메시지 처리
     */
    private async handleSetModeDark(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ): Promise<boolean> {
        try {
            logger.debug("다크 모드 설정 메시지 처리");

            // 즉시 응답을 보내고 비동기 작업을 별도로 처리
            sendResponse({ success: true });

            // 스타일 서비스가 있다면 해당 서비스에 위임
            if (contentServiceManager.isReady()) {
                try {
                    const styleService =
                        contentServiceManager.getService<StyleService>("style");
                    if (styleService && styleService.setMode) {
                        await styleService.setMode("dark");
                    }
                } catch (error) {
                    logger.warn("스타일 서비스를 찾을 수 없습니다:", error);
                }
            }

            return true;
        } catch (error) {
            logger.error("다크 모드 설정 메시지 처리 중 오류:", error);
            return false;
        }
    }

    /**
     * 고대비 모드 설정 메시지 처리
     */
    private async handleSetModeHighContrast(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ): Promise<boolean> {
        try {
            logger.debug("고대비 모드 설정 메시지 처리");

            // 즉시 응답을 보내고 비동기 작업을 별도로 처리
            sendResponse({ success: true });

            // 스타일 서비스가 있다면 해당 서비스에 위임
            if (contentServiceManager.isReady()) {
                try {
                    const styleService =
                        contentServiceManager.getService<StyleService>("style");
                    if (styleService && styleService.setMode) {
                        await styleService.setMode("high-contrast");
                    }
                } catch (error) {
                    logger.warn("스타일 서비스를 찾을 수 없습니다:", error);
                }
            }

            return true;
        } catch (error) {
            logger.error("고대비 모드 설정 메시지 처리 중 오류:", error);
            return false;
        }
    }

    /**
     * 폰트 크기 XS 설정 메시지 처리
     */
    private async handleSetFontSizeXS(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ): Promise<boolean> {
        try {
            logger.debug("폰트 크기 XS 설정 메시지 처리");

            // 즉시 응답을 보내고 비동기 작업을 별도로 처리
            sendResponse({ success: true });

            // 스타일 서비스가 있다면 해당 서비스에 위임
            if (contentServiceManager.isReady()) {
                try {
                    const styleService =
                        contentServiceManager.getService<StyleService>("style");
                    if (styleService && styleService.setFontSize) {
                        await styleService.setFontSize("xs");
                    }
                } catch (error) {
                    logger.warn("스타일 서비스를 찾을 수 없습니다:", error);
                }
            }

            return true;
        } catch (error) {
            logger.error("폰트 크기 XS 설정 메시지 처리 중 오류:", error);
            return false;
        }
    }

    /**
     * 폰트 크기 S 설정 메시지 처리
     */
    private async handleSetFontSizeS(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ): Promise<boolean> {
        try {
            logger.debug("폰트 크기 S 설정 메시지 처리");

            // 즉시 응답을 보내고 비동기 작업을 별도로 처리
            sendResponse({ success: true });

            // 스타일 서비스가 있다면 해당 서비스에 위임
            if (contentServiceManager.isReady()) {
                try {
                    const styleService =
                        contentServiceManager.getService<StyleService>("style");
                    if (styleService && styleService.setFontSize) {
                        await styleService.setFontSize("s");
                    }
                } catch (error) {
                    logger.warn("스타일 서비스를 찾을 수 없습니다:", error);
                }
            }

            return true;
        } catch (error) {
            logger.error("폰트 크기 S 설정 메시지 처리 중 오류:", error);
            return false;
        }
    }

    /**
     * 폰트 크기 M 설정 메시지 처리
     */
    private async handleSetFontSizeM(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ): Promise<boolean> {
        try {
            logger.debug("폰트 크기 M 설정 메시지 처리");

            // 즉시 응답을 보내고 비동기 작업을 별도로 처리
            sendResponse({ success: true });

            // 스타일 서비스가 있다면 해당 서비스에 위임
            if (contentServiceManager.isReady()) {
                try {
                    const styleService =
                        contentServiceManager.getService<StyleService>("style");
                    if (styleService && styleService.setFontSize) {
                        await styleService.setFontSize("m");
                    }
                } catch (error) {
                    logger.warn("스타일 서비스를 찾을 수 없습니다:", error);
                }
            }

            return true;
        } catch (error) {
            logger.error("폰트 크기 M 설정 메시지 처리 중 오류:", error);
            return false;
        }
    }

    /**
     * 폰트 크기 L 설정 메시지 처리
     */
    private async handleSetFontSizeL(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ): Promise<boolean> {
        try {
            logger.debug("폰트 크기 L 설정 메시지 처리");

            // 즉시 응답을 보내고 비동기 작업을 별도로 처리
            sendResponse({ success: true });

            // 스타일 서비스가 있다면 해당 서비스에 위임
            if (contentServiceManager.isReady()) {
                try {
                    const styleService =
                        contentServiceManager.getService<StyleService>("style");
                    if (styleService && styleService.setFontSize) {
                        await styleService.setFontSize("l");
                    }
                } catch (error) {
                    logger.warn("스타일 서비스를 찾을 수 없습니다:", error);
                }
            }

            return true;
        } catch (error) {
            logger.error("폰트 크기 L 설정 메시지 처리 중 오류:", error);
            return false;
        }
    }

    /**
     * 폰트 크기 XL 설정 메시지 처리
     */
    private async handleSetFontSizeXL(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ): Promise<boolean> {
        try {
            logger.debug("폰트 크기 XL 설정 메시지 처리");

            // 즉시 응답을 보내고 비동기 작업을 별도로 처리
            sendResponse({ success: true });

            // 스타일 서비스가 있다면 해당 서비스에 위임
            if (contentServiceManager.isReady()) {
                try {
                    const styleService =
                        contentServiceManager.getService<StyleService>("style");
                    if (styleService && styleService.setFontSize) {
                        await styleService.setFontSize("xl");
                    }
                } catch (error) {
                    logger.warn("스타일 서비스를 찾을 수 없습니다:", error);
                }
            }

            return true;
        } catch (error) {
            logger.error("폰트 크기 XL 설정 메시지 처리 중 오류:", error);
            return false;
        }
    }

    /**
     * 폰트 굵기 Regular 설정 메시지 처리
     */
    private async handleSetFontWeightRegular(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ): Promise<boolean> {
        try {
            logger.debug("폰트 굵기 Regular 설정 메시지 처리");

            // 즉시 응답을 보내고 비동기 작업을 별도로 처리
            sendResponse({ success: true });

            // 스타일 서비스가 있다면 해당 서비스에 위임
            if (contentServiceManager.isReady()) {
                try {
                    const styleService =
                        contentServiceManager.getService<StyleService>("style");
                    if (styleService && styleService.setFontWeight) {
                        await styleService.setFontWeight("regular");
                    }
                } catch (error) {
                    logger.warn("스타일 서비스를 찾을 수 없습니다:", error);
                }
            }

            return true;
        } catch (error) {
            logger.error("폰트 굵기 Regular 설정 메시지 처리 중 오류:", error);
            return false;
        }
    }

    /**
     * 폰트 굵기 Normal 설정 메시지 처리
     */
    private async handleSetFontWeightNormal(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ): Promise<boolean> {
        try {
            logger.debug("폰트 굵기 Normal 설정 메시지 처리");

            // 즉시 응답을 보내고 비동기 작업을 별도로 처리
            sendResponse({ success: true });

            // 스타일 서비스가 있다면 해당 서비스에 위임
            if (contentServiceManager.isReady()) {
                try {
                    const styleService =
                        contentServiceManager.getService<StyleService>("style");
                    if (styleService && styleService.setFontWeight) {
                        await styleService.setFontWeight("normal");
                    }
                } catch (error) {
                    logger.warn("스타일 서비스를 찾을 수 없습니다:", error);
                }
            }

            return true;
        } catch (error) {
            logger.error("폰트 굵기 Normal 설정 메시지 처리 중 오류:", error);
            return false;
        }
    }

    /**
     * 폰트 굵기 Bold 설정 메시지 처리
     */
    private async handleSetFontWeightBold(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ): Promise<boolean> {
        try {
            logger.debug("폰트 굵기 Bold 설정 메시지 처리");

            // 즉시 응답을 보내고 비동기 작업을 별도로 처리
            sendResponse({ success: true });

            // 스타일 서비스가 있다면 해당 서비스에 위임
            if (contentServiceManager.isReady()) {
                try {
                    const styleService =
                        contentServiceManager.getService<StyleService>("style");
                    if (styleService && styleService.setFontWeight) {
                        await styleService.setFontWeight("bold");
                    }
                } catch (error) {
                    logger.warn("스타일 서비스를 찾을 수 없습니다:", error);
                }
            }

            return true;
        } catch (error) {
            logger.error("폰트 굵기 Bold 설정 메시지 처리 중 오류:", error);
            return false;
        }
    }

    /**
     * 폰트 굵기 XBold 설정 메시지 처리
     */
    private async handleSetFontWeightXBold(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ): Promise<boolean> {
        try {
            logger.debug("폰트 굵기 XBold 설정 메시지 처리");

            // 즉시 응답을 보내고 비동기 작업을 별도로 처리
            sendResponse({ success: true });

            // 스타일 서비스가 있다면 해당 서비스에 위임
            if (contentServiceManager.isReady()) {
                try {
                    const styleService =
                        contentServiceManager.getService<StyleService>("style");
                    if (styleService && styleService.setFontWeight) {
                        await styleService.setFontWeight("xbold");
                    }
                } catch (error) {
                    logger.warn("스타일 서비스를 찾을 수 없습니다:", error);
                }
            }

            return true;
        } catch (error) {
            logger.error("폰트 굵기 XBold 설정 메시지 처리 중 오류:", error);
            return false;
        }
    }

    /**
     * 상품 제목 요청 처리
     */
    private async handleGetProductTitle(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ): Promise<boolean> {
        try {
            const titleEl = document.querySelector("h1.prod-buy-header__title");
            const title = titleEl?.textContent?.trim() ?? "";
            logger.debug("[voim][content] 추출된 title:", title);
            sendResponse({ title });
            return true;
        } catch (error) {
            logger.error("상품 제목 요청 처리 중 오류:", error);
            sendResponse({
                error: error instanceof Error ? error.message : String(error),
            });
            return false;
        }
    }

    /**
     * 벤더 HTML 요청 처리
     */
    private async handleGetVendorHtml(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ): Promise<boolean> {
        try {
            const vendorEl = document.querySelector(".vendor-item");
            if (!vendorEl) {
                logger.warn("[voim][content] .vendor-item 감지 실패");
                sendResponse({ html: "", productId: "" });
                return true;
            }

            const rawHtml = vendorEl.outerHTML
                .replace(/\sonerror=\"[^\"]*\"/g, "")
                .replace(/\n/g, "")
                .trim();

            const match = window.location.href.match(/products\/(\d+)/);
            const productId = match?.[1] ?? "";

            sendResponse({ html: rawHtml, productId });
            return true;
        } catch (error) {
            logger.error("벤더 HTML 요청 처리 중 오류:", error);
            sendResponse({
                error: error instanceof Error ? error.message : String(error),
            });
            return false;
        }
    }

    /**
     * 장바구니 아이템 업데이트 처리
     */
    private async handleCartItemsUpdated(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ): Promise<boolean> {
        try {
            logger.debug("장바구니 아이템 업데이트 처리:", message);
            sendResponse({ success: true });
            return true;
        } catch (error) {
            logger.error("장바구니 아이템 업데이트 처리 중 오류:", error);
            sendResponse({
                error: error instanceof Error ? error.message : String(error),
            });
            return false;
        }
    }

    /**
     * 서비스의 초기화 상태를 확인합니다.
     */
    public isReady(): boolean {
        return this.isInitialized;
    }
}

// 싱글턴 인스턴스 내보내기
export const contentMessageService = ContentMessageService.getInstance();
