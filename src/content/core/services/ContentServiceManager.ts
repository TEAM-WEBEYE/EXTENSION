import { logger } from "@src/utils/logger";
import { styleService } from "./StyleService";
import { settingsService } from "./SettingsService";

/**
 * Content Script용 서비스 관리자 (싱글턴)
 * Content script의 모든 서비스를 중앙 집중식으로 관리합니다.
 */
class ContentServiceManager {
    private static instance: ContentServiceManager;
    private isInitialized: boolean = false;
    private services: Map<string, any> = new Map();
    private messageHandlers: Map<string, Function> = new Map();

    private constructor() {
        // private constructor to prevent direct instantiation
    }

    /**
     * 싱글턴 인스턴스를 반환합니다.
     */
    public static getInstance(): ContentServiceManager {
        if (!ContentServiceManager.instance) {
            ContentServiceManager.instance = new ContentServiceManager();
        }
        return ContentServiceManager.instance;
    }

    /**
     * 서비스 매니저를 초기화합니다.
     */
    public async initialize(): Promise<void> {
        if (this.isInitialized) {
            logger.debug("ContentServiceManager가 이미 초기화되었습니다.");
            return;
        }

        try {
            logger.debug("ContentServiceManager 초기화 시작");

            // 서비스들을 등록
            this.registerService("style", styleService);
            this.registerService("settings", settingsService);

            // 서비스들을 초기화
            await styleService.initialize();
            await settingsService.initialize();

            // 메시지 리스너 등록
            this.initMessageListener();

            this.isInitialized = true;
            logger.debug("ContentServiceManager 초기화 완료");
        } catch (error) {
            logger.error("ContentServiceManager 초기화 중 오류:", error);
            throw error;
        }
    }

    /**
     * 서비스를 등록합니다.
     */
    public registerService(name: string, service: any): void {
        this.services.set(name, service);
        logger.debug(`Content 서비스 등록됨: ${name}`);
    }

    /**
     * 등록된 서비스를 반환합니다.
     */
    public getService<T>(name: string): T {
        const service = this.services.get(name);
        if (!service) {
            throw new Error(`서비스를 찾을 수 없습니다: ${name}`);
        }
        return service as T;
    }

    /**
     * 메시지 핸들러를 등록합니다.
     */
    public registerMessageHandler(type: string, handler: Function): void {
        this.messageHandlers.set(type, handler);
        logger.debug(`메시지 핸들러 등록됨: ${type}`);
    }

    /**
     * Chrome 메시지 리스너를 초기화합니다.
     */
    private initMessageListener(): void {
        chrome.runtime.onMessage.addListener(
            (message, sender, sendResponse) => {
                try {
                    // Extension context가 유효한지 확인
                    if (!chrome.runtime?.id) {
                        logger.warn("Extension context가 유효하지 않습니다.");
                        return false;
                    }

                    const handler = this.messageHandlers.get(message.type);

                    if (handler) {
                        logger.debug(
                            `메시지 처리 중: ${message.type}`,
                            message,
                        );

                        // 안전한 응답 함수 생성
                        const safeSendResponse = (response?: any) => {
                            try {
                                if (chrome.runtime?.id) {
                                    sendResponse(response);
                                }
                            } catch (error) {
                                logger.warn("응답 전송 중 오류:", error);
                            }
                        };

                        const result = handler(
                            message,
                            sender,
                            safeSendResponse,
                        );
                        logger.debug(`메시지 처리 완료: ${message.type}`, {
                            result,
                        });
                        return result;
                    } else {
                        logger.warn(
                            `처리되지 않은 메시지 타입: ${message.type}`,
                        );
                        return false;
                    }
                } catch (error) {
                    logger.error("메시지 처리 중 오류:", error);
                    return false;
                }
            },
        );
    }

    /**
     * 모든 서비스를 동기화합니다.
     */
    public async syncAllServices(): Promise<void> {
        try {
            logger.debug("모든 Content 서비스 동기화 시작");
            this.services.forEach((service, name) => {
                if (service.sync && typeof service.sync === "function") {
                    service.sync();
                    logger.debug(`Content 서비스 동기화 완료: ${name}`);
                }
            });
            logger.debug("모든 Content 서비스 동기화 완료");
        } catch (error) {
            logger.error("Content 서비스 동기화 중 오류:", error);
            throw error;
        }
    }

    /**
     * 서비스 매니저의 초기화 상태를 확인합니다.
     */
    public isReady(): boolean {
        return this.isInitialized;
    }

    /**
     * 서비스 매니저를 정리합니다.
     */
    public async cleanup(): Promise<void> {
        try {
            logger.debug("ContentServiceManager 정리 시작");
            this.services.forEach((service, name) => {
                if (service.cleanup && typeof service.cleanup === "function") {
                    service.cleanup();
                    logger.debug(`Content 서비스 정리 완료: ${name}`);
                }
            });
            this.isInitialized = false;
            logger.debug("ContentServiceManager 정리 완료");
        } catch (error) {
            logger.error("ContentServiceManager 정리 중 오류:", error);
            throw error;
        }
    }
}

// 싱글턴 인스턴스 내보내기
export const contentServiceManager = ContentServiceManager.getInstance();
