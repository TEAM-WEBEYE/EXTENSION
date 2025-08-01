import { logger } from "@src/utils/logger";
import { serviceManager } from "./ServiceManager";

export interface MessageHandler {
    type: string;
    handler: (
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ) => boolean | Promise<boolean>;
}

/**
 * 메시지 서비스 (싱글턴)
 * background와 content script 간의 모든 메시지 통신을 중앙에서 관리합니다.
 */
class MessageService {
    private static instance: MessageService;
    private handlers: Map<string, MessageHandler> = new Map();
    private isInitialized: boolean = false;

    private constructor() {
        // private constructor to prevent direct instantiation
    }

    /**
     * 싱글턴 인스턴스를 반환합니다.
     */
    public static getInstance(): MessageService {
        if (!MessageService.instance) {
            MessageService.instance = new MessageService();
        }
        return MessageService.instance;
    }

    /**
     * 메시지 서비스를 초기화합니다.
     */
    public initialize(): void {
        if (this.isInitialized) {
            logger.debug("MessageService가 이미 초기화되었습니다.");
            return;
        }

        try {
            logger.debug("MessageService 초기화 시작");

            // 기본 메시지 핸들러 등록
            this.registerDefaultHandlers();

            // Chrome 메시지 리스너 등록
            chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));

            this.isInitialized = true;
            logger.debug("MessageService 초기화 완료");
        } catch (error) {
            logger.error("MessageService 초기화 중 오류:", error);
            throw error;
        }
    }

    /**
     * 메시지 핸들러를 등록합니다.
     */
    public registerHandler(handler: MessageHandler): void {
        this.handlers.set(handler.type, handler);
        logger.debug(`메시지 핸들러 등록됨: ${handler.type}`);
    }

    /**
     * 등록된 핸들러를 제거합니다.
     */
    public unregisterHandler(type: string): void {
        this.handlers.delete(type);
        logger.debug(`메시지 핸들러 제거됨: ${type}`);
    }

    /**
     * 메시지를 처리합니다.
     */
    private async handleMessage(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ): Promise<boolean> {
        try {
            const handler = this.handlers.get(message.type);

            if (!handler) {
                logger.warn(`처리되지 않은 메시지 타입: ${message.type}`);
                return false;
            }

            logger.debug(`메시지 처리 중: ${message.type}`, message);

            const result = await handler.handler(message, sender, sendResponse);

            logger.debug(`메시지 처리 완료: ${message.type}`, { result });

            return result;
        } catch (error) {
            logger.error(`메시지 처리 중 오류: ${message.type}`, error);
            sendResponse({
                error: error instanceof Error ? error.message : String(error),
            });
            return false;
        }
    }

    /**
     * 기본 메시지 핸들러들을 등록합니다.
     */
    private registerDefaultHandlers(): void {
        // 페이지 타입 메시지
        this.registerHandler({
            type: "PAGE_TYPE",
            handler: this.handlePageType.bind(this),
        });

        // 장바구니 페이지 메시지
        this.registerHandler({
            type: "CART_PAGE",
            handler: this.handleCartPage.bind(this),
        });

        // 장바구니 아이템 업데이트
        this.registerHandler({
            type: "CART_ITEMS_UPDATED",
            handler: this.handleCartItemsUpdated.bind(this),
        });

        // 스타일 관련 메시지들
        this.registerHandler({
            type: "SET_MODE_LIGHT",
            handler: this.handleStyleMessage.bind(this),
        });

        this.registerHandler({
            type: "SET_MODE_DARK",
            handler: this.handleStyleMessage.bind(this),
        });

        this.registerHandler({
            type: "SET_FONT_SIZE_XS",
            handler: this.handleStyleMessage.bind(this),
        });

        this.registerHandler({
            type: "SET_FONT_SIZE_S",
            handler: this.handleStyleMessage.bind(this),
        });

        this.registerHandler({
            type: "SET_FONT_SIZE_M",
            handler: this.handleStyleMessage.bind(this),
        });

        this.registerHandler({
            type: "SET_FONT_SIZE_L",
            handler: this.handleStyleMessage.bind(this),
        });

        this.registerHandler({
            type: "SET_FONT_SIZE_XL",
            handler: this.handleStyleMessage.bind(this),
        });

        this.registerHandler({
            type: "SET_FONT_WEIGHT_REGULAR",
            handler: this.handleStyleMessage.bind(this),
        });

        this.registerHandler({
            type: "SET_FONT_WEIGHT_NORMAL",
            handler: this.handleStyleMessage.bind(this),
        });

        this.registerHandler({
            type: "SET_FONT_WEIGHT_BOLD",
            handler: this.handleStyleMessage.bind(this),
        });

        this.registerHandler({
            type: "SET_FONT_WEIGHT_XBOLD",
            handler: this.handleStyleMessage.bind(this),
        });

        this.registerHandler({
            type: "RESET_SETTINGS",
            handler: this.handleStyleMessage.bind(this),
        });

        // API 요청들
        this.registerHandler({
            type: "FETCH_FOOD_DATA",
            handler: this.handleFetchFoodData.bind(this),
        });

        this.registerHandler({
            type: "FETCH_IMAGE_ANALYSIS",
            handler: this.handleFetchImageAnalysis.bind(this),
        });

        this.registerHandler({
            type: "FETCH_OUTLINE_INFO",
            handler: this.handleFetchOutlineInfo.bind(this),
        });

        this.registerHandler({
            type: "FETCH_COSMETIC_DATA",
            handler: this.handleFetchCosmeticData.bind(this),
        });

        this.registerHandler({
            type: "FETCH_REVIEW_SUMMARY",
            handler: this.handleFetchReviewSummary.bind(this),
        });

        this.registerHandler({
            type: "FETCH_HEALTH_DATA",
            handler: this.handleFetchHealthData.bind(this),
        });

        this.registerHandler({
            type: "FETCH_VENDOR_HTML",
            handler: this.handleFetchVendorHtml.bind(this),
        });

        this.registerHandler({
            type: "GET_PRODUCT_TITLE",
            handler: this.handleGetProductTitle.bind(this),
        });
    }

    /**
     * 페이지 타입 메시지 처리
     */
    private async handlePageType(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ): Promise<boolean> {
        try {
            const tabs = await chrome.tabs.query({
                active: true,
                currentWindow: true,
            });
            const activeTab = tabs[0];

            if (activeTab?.id) {
                await chrome.tabs.sendMessage(activeTab.id, {
                    type: "PAGE_TYPE",
                    value: message.value,
                });
            }

            sendResponse({ success: true });
            return true;
        } catch (error) {
            logger.error("페이지 타입 메시지 처리 중 오류:", error);
            sendResponse({
                error: error instanceof Error ? error.message : String(error),
            });
            return false;
        }
    }

    /**
     * 장바구니 페이지 메시지 처리
     */
    private async handleCartPage(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ): Promise<boolean> {
        try {
            const tabs = await chrome.tabs.query({
                active: true,
                currentWindow: true,
            });
            const activeTab = tabs[0];

            if (activeTab?.id) {
                await chrome.tabs.sendMessage(activeTab.id, {
                    type: "CART_PAGE",
                    value: message.value,
                });
            }

            sendResponse({ success: true });
            return true;
        } catch (error) {
            logger.error("장바구니 페이지 메시지 처리 중 오류:", error);
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
            // 장바구니 아이템 정보를 저장
            await chrome.storage.local.set({ cartItems: message.data });

            // 현재 활성화된 탭에 업데이트된 장바구니 정보 전달
            const tabs = await chrome.tabs.query({
                active: true,
                currentWindow: true,
            });
            const activeTab = tabs[0];

            if (activeTab?.id) {
                try {
                    await chrome.tabs.sendMessage(activeTab.id, {
                        type: "CART_ITEMS_UPDATED",
                        data: message.data,
                    });
                } catch (error) {
                    // 메시지 전송 실패 시 무시
                    logger.warn("장바구니 업데이트 메시지 전송 실패:", error);
                }
            }

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
     * 스타일 관련 메시지 처리
     */
    private async handleStyleMessage(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ): Promise<boolean> {
        try {
            const tabs = await chrome.tabs.query({
                active: true,
                currentWindow: true,
            });
            const activeTab = tabs[0];

            if (activeTab?.id) {
                await chrome.tabs.sendMessage(activeTab.id, {
                    type: message.type,
                    value: message.value,
                });
            }

            sendResponse({ success: true });
            return true;
        } catch (error) {
            logger.error("스타일 메시지 처리 중 오류:", error);
            sendResponse({
                error: error instanceof Error ? error.message : String(error),
            });
            return false;
        }
    }

    /**
     * 음식 데이터 API 요청 처리
     */
    private async handleFetchFoodData(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ): Promise<boolean> {
        try {
            const tabs = await chrome.tabs.query({
                active: true,
                currentWindow: true,
            });
            const activeTab = tabs[0];

            if (!activeTab?.url) {
                sendResponse({
                    status: 400,
                    error: "상품 페이지를 찾을 수 없습니다.",
                });
                return true;
            }

            const productId = activeTab.url.match(/vp\/products\/(\d+)/)?.[1];
            if (!productId) {
                sendResponse({
                    status: 400,
                    error: "상품 ID를 찾을 수 없습니다.",
                });
                return true;
            }

            const payload = {
                ...message.payload,
                productId,
            };

            const response = await fetch(
                "https://voim.store/api/v1/products/foods",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                },
            );

            const text = await response.text();

            try {
                const json = JSON.parse(text);
                if (response.ok) {
                    sendResponse({ status: 200, data: json });
                } else {
                    sendResponse({
                        status: response.status,
                        error: json?.message ?? "에러 발생",
                    });
                }
            } catch (err) {
                logger.error("[voim] JSON 파싱 실패", text);
                sendResponse({
                    status: response.status,
                    error: "JSON 파싱 실패",
                });
            }

            return true;
        } catch (error) {
            logger.error("음식 데이터 API 요청 처리 중 오류:", error);
            sendResponse({
                error: error instanceof Error ? error.message : String(error),
            });
            return false;
        }
    }

    /**
     * 이미지 분석 API 요청 처리
     */
    private async handleFetchImageAnalysis(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ): Promise<boolean> {
        try {
            const imageUrl = message.payload?.url;

            const response = await fetch(
                "https://voim.store/api/v1/image-analysis",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url: imageUrl }),
                },
            );

            const data = await response.json();
            logger.debug("이미지 분석 API 응답:", data);

            if (sender.tab?.id) {
                await chrome.tabs.sendMessage(sender.tab.id, {
                    type: "IMAGE_ANALYSIS_RESPONSE",
                    data: data.data,
                });
            }

            sendResponse({
                type: "IMAGE_ANALYSIS_RESPONSE",
                data: data.data,
            });

            return true;
        } catch (error) {
            logger.error("이미지 분석 API 요청 처리 중 오류:", error);

            if (sender.tab?.id) {
                await chrome.tabs.sendMessage(sender.tab.id, {
                    type: "IMAGE_ANALYSIS_ERROR",
                    error:
                        error instanceof Error ? error.message : String(error),
                });
            }

            sendResponse({
                type: "IMAGE_ANALYSIS_ERROR",
                error: error instanceof Error ? error.message : String(error),
            });

            return false;
        }
    }

    /**
     * 개요 정보 API 요청 처리
     */
    private async handleFetchOutlineInfo(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ): Promise<boolean> {
        try {
            const { outline, html } = message.payload;

            const tabs = await chrome.tabs.query({
                active: true,
                currentWindow: true,
            });
            const activeTab = tabs[0];

            if (!activeTab?.url) {
                sendResponse({
                    type: "OUTLINE_INFO_ERROR",
                    error: "상품 페이지를 찾을 수 없습니다.",
                });
                return true;
            }

            const productId = activeTab.url.match(/vp\/products\/(\d+)/)?.[1];
            if (!productId) {
                sendResponse({
                    type: "OUTLINE_INFO_ERROR",
                    error: "상품 ID를 찾을 수 없습니다.",
                });
                return true;
            }

            const response = await fetch(
                `https://voim.store/api/v1/product-detail/${outline}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ html, productId }),
                },
            );

            const data = await response.json();

            if (sender.tab?.id) {
                await chrome.tabs.sendMessage(sender.tab.id, {
                    type: "OUTLINE_INFO_RESPONSE",
                    data: data.data,
                });
            }

            sendResponse({
                type: "OUTLINE_INFO_RESPONSE",
                data: data.data,
            });

            return true;
        } catch (error) {
            logger.error("개요 정보 API 요청 처리 중 오류:", error);

            if (sender.tab?.id) {
                await chrome.tabs.sendMessage(sender.tab.id, {
                    type: "OUTLINE_INFO_ERROR",
                    error:
                        error instanceof Error ? error.message : String(error),
                });
            }

            sendResponse({
                type: "OUTLINE_INFO_ERROR",
                error: error instanceof Error ? error.message : String(error),
            });

            return false;
        }
    }

    /**
     * 화장품 데이터 API 요청 처리
     */
    private async handleFetchCosmeticData(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ): Promise<boolean> {
        try {
            const { productId, html } = message.payload;

            const response = await fetch("https://voim.store/api/v1/cosmetic", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId, html }),
            });

            const data = await response.json();
            const raw = data?.data;

            if (!raw || typeof raw !== "object") {
                logger.warn("[voim][background] data.data 형식 이상함:", raw);
                sendResponse({
                    type: "COSMETIC_DATA_ERROR",
                    error: "API 응답 형식 오류",
                });
                return true;
            }

            sendResponse({
                type: "COSMETIC_DATA_RESPONSE",
                data: raw,
            });

            if (sender.tab?.id) {
                await chrome.tabs.sendMessage(sender.tab.id, {
                    type: "COSMETIC_DATA_RESPONSE",
                    data: raw,
                });
            }

            return true;
        } catch (error) {
            logger.error("화장품 데이터 API 요청 처리 중 오류:", error);

            sendResponse({
                type: "COSMETIC_DATA_ERROR",
                error: error instanceof Error ? error.message : String(error),
            });

            if (sender.tab?.id) {
                await chrome.tabs.sendMessage(sender.tab.id, {
                    type: "COSMETIC_DATA_ERROR",
                    error:
                        error instanceof Error ? error.message : String(error),
                });
            }

            return false;
        }
    }

    /**
     * 리뷰 요약 API 요청 처리
     */
    private async handleFetchReviewSummary(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ): Promise<boolean> {
        try {
            const { productId, reviewRating, reviews } = message.payload;

            const response = await fetch(
                "https://voim.store/api/v1/review/summary",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productId, reviewRating, reviews }),
                },
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.message ||
                        `HTTP error! status: ${response.status}`,
                );
            }

            const data = await response.json();

            if (!data.data) {
                throw new Error("서버 응답에 데이터가 없습니다.");
            }

            if (sender.tab?.id) {
                await chrome.tabs.sendMessage(sender.tab.id, {
                    type: "REVIEW_SUMMARY_RESPONSE",
                    data: data.data,
                });
            }

            sendResponse({
                type: "REVIEW_SUMMARY_RESPONSE",
                data: data.data,
            });

            return true;
        } catch (error) {
            logger.error("리뷰 요약 API 요청 처리 중 오류:", error);
            const errorMessage =
                (error instanceof Error ? error.message : String(error)) ||
                "리뷰 요약 처리 중 오류가 발생했습니다";

            if (sender.tab?.id) {
                await chrome.tabs.sendMessage(sender.tab.id, {
                    type: "REVIEW_SUMMARY_ERROR",
                    error: errorMessage,
                });
            }

            sendResponse({
                type: "REVIEW_SUMMARY_ERROR",
                error: errorMessage,
            });

            return false;
        }
    }

    /**
     * 건강 데이터 API 요청 처리
     */
    private async handleFetchHealthData(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ): Promise<boolean> {
        try {
            const { productId, title, html, birthYear, gender, allergies } =
                message.payload;

            const response = await fetch(
                "https://voim.store/api/v1/health-food/keywords",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        productId,
                        title,
                        html,
                        birthYear,
                        gender,
                        allergies,
                    }),
                },
            );

            const data = await response.json();

            if (sender.tab?.id) {
                await chrome.tabs.sendMessage(sender.tab.id, {
                    type: "HEALTH_DATA_RESPONSE",
                    data: data.data,
                });
            }

            sendResponse({ type: "HEALTH_DATA_RESPONSE", data: data.data });

            return true;
        } catch (error) {
            logger.error("건강 데이터 API 요청 처리 중 오류:", error);

            if (sender.tab?.id) {
                await chrome.tabs.sendMessage(sender.tab.id, {
                    type: "HEALTH_DATA_ERROR",
                    error:
                        error instanceof Error ? error.message : String(error),
                });
            }

            sendResponse({
                type: "HEALTH_DATA_ERROR",
                error: error instanceof Error ? error.message : String(error),
            });

            return false;
        }
    }

    /**
     * 벤더 HTML 요청 처리
     */
    private async handleFetchVendorHtml(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ): Promise<boolean> {
        try {
            if (sender.tab?.id) {
                await chrome.tabs.sendMessage(
                    sender.tab.id,
                    { type: "GET_VENDOR_HTML" },
                    (response) => {
                        sendResponse(response);
                    },
                );
            }

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
     * 상품 제목 요청 처리
     */
    private async handleGetProductTitle(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ): Promise<boolean> {
        try {
            const tabs = await chrome.tabs.query({
                active: true,
                currentWindow: true,
            });
            const tabId = tabs[0]?.id;

            if (!tabId) {
                sendResponse({ title: "" });
                return true;
            }

            await chrome.tabs.sendMessage(
                tabId,
                { type: "GET_PRODUCT_TITLE" },
                (response) => {
                    if (chrome.runtime.lastError) {
                        logger.error(
                            "[voim][background] title 요청 실패:",
                            chrome.runtime.lastError.message,
                        );
                        sendResponse({ title: "" });
                    } else {
                        sendResponse(response);
                    }
                },
            );

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
     * 서비스의 초기화 상태를 확인합니다.
     */
    public isReady(): boolean {
        return this.isInitialized;
    }
}

// 싱글턴 인스턴스 내보내기
export const messageService = MessageService.getInstance();
