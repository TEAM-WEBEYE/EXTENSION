import { storageService } from "./storageService";
import { settingsService } from "./settingsService";
import { iframeService } from "./iframeService";
import { storageCleanupService } from "./StorageCleanupService";
import { messageService } from "./MessageService";
import { logger } from "@src/utils/logger";

/**
 * 모든 background 서비스를 관리하는 싱글턴 매니저
 */
class ServiceManager {
    private static instance: ServiceManager;
    private isInitialized: boolean = false;
    private services: Map<string, any> = new Map();

    private constructor() {
        // private constructor to prevent direct instantiation
    }

    /**
     * 싱글턴 인스턴스를 반환합니다.
     */
    public static getInstance(): ServiceManager {
        if (!ServiceManager.instance) {
            ServiceManager.instance = new ServiceManager();
        }
        return ServiceManager.instance;
    }

    /**
     * 서비스 매니저를 초기화합니다.
     */
    public async initialize(): Promise<void> {
        if (this.isInitialized) {
            logger.debug("ServiceManager가 이미 초기화되었습니다.");
            return;
        }

        try {
            logger.debug("ServiceManager 초기화 시작");

            // 서비스들을 등록
            this.registerService("storage", storageService);
            this.registerService("settings", settingsService);
            this.registerService("iframe", iframeService);
            this.registerService("storageCleanup", storageCleanupService);
            this.registerService("message", messageService);

            // 서비스들을 초기화
            await storageService.loadInitialSettings();
            await iframeService.initialize();
            await storageCleanupService.initialize();
            await messageService.initialize();

            this.isInitialized = true;
            logger.debug("ServiceManager 초기화 완료");
        } catch (error) {
            logger.error("ServiceManager 초기화 중 오류:", error);
            throw error;
        }
    }

    /**
     * 서비스를 등록합니다.
     */
    public registerService(name: string, service: any): void {
        this.services.set(name, service);
        logger.debug(`서비스 등록됨: ${name}`);
    }

    /**
     * 등록된 서비스를 가져옵니다.
     */
    public getService<T>(name: string): T {
        const service = this.services.get(name);
        if (!service) {
            throw new Error(`서비스를 찾을 수 없습니다: ${name}`);
        }
        return service as T;
    }

    /**
     * 모든 서비스를 동기화합니다.
     */
    public async syncAllServices(): Promise<void> {
        try {
            logger.debug("모든 서비스 동기화 시작");
            this.services.forEach((service, name) => {
                if (service.sync && typeof service.sync === "function") {
                    service.sync();
                    logger.debug(`서비스 동기화 완료: ${name}`);
                }
            });
            logger.debug("모든 서비스 동기화 완료");
        } catch (error) {
            logger.error("서비스 동기화 중 오류:", error);
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
            logger.debug("ServiceManager 정리 시작");
            this.services.forEach((service, name) => {
                if (service.cleanup && typeof service.cleanup === "function") {
                    service.cleanup();
                    logger.debug(`서비스 정리 완료: ${name}`);
                }
            });
            this.isInitialized = false;
            logger.debug("ServiceManager 정리 완료");
        } catch (error) {
            logger.error("ServiceManager 정리 중 오류:", error);
            throw error;
        }
    }
}

// 싱글턴 인스턴스 내보내기
export const serviceManager = ServiceManager.getInstance();
