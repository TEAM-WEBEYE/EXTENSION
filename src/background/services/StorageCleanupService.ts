import { logger } from "@src/utils/logger";
import { STORAGE_KEYS } from "../constants";

/**
 * 스토리지 정리 서비스 (싱글턴)
 * 불필요한 스토리지 데이터를 정리하고 관리합니다.
 */
class StorageCleanupService {
    private static instance: StorageCleanupService;
    private isInitialized: boolean = false;

    private constructor() {
        // private constructor to prevent direct instantiation
    }

    /**
     * 싱글턴 인스턴스를 반환합니다.
     */
    public static getInstance(): StorageCleanupService {
        if (!StorageCleanupService.instance) {
            StorageCleanupService.instance = new StorageCleanupService();
        }
        return StorageCleanupService.instance;
    }

    /**
     * 서비스를 초기화합니다.
     */
    public async initialize(): Promise<void> {
        if (this.isInitialized) {
            logger.debug("StorageCleanupService가 이미 초기화되었습니다.");
            return;
        }

        try {
            logger.debug("StorageCleanupService 초기화 시작");

            // 초기 정리 작업 수행
            await this.cleanupUnnecessaryData();

            this.isInitialized = true;
            logger.debug("StorageCleanupService 초기화 완료");
        } catch (error) {
            logger.error("StorageCleanupService 초기화 중 오류:", error);
            throw error;
        }
    }

    /**
     * 불필요한 스토리지 데이터를 정리합니다.
     */
    public async cleanupUnnecessaryData(): Promise<void> {
        try {
            logger.debug("불필요한 스토리지 데이터 정리 시작");

            // 현재 스토리지의 모든 키를 가져옴
            const allData = await chrome.storage.local.get(null);
            const keysToKeep = this.getKeysToKeep();
            const keysToRemove: string[] = [];

            // 유지할 키가 아닌 모든 키를 제거 대상으로 추가
            Object.keys(allData).forEach((key) => {
                if (!keysToKeep.includes(key)) {
                    keysToRemove.push(key);
                }
            });

            // 불필요한 키들 제거
            if (keysToRemove.length > 0) {
                await chrome.storage.local.remove(keysToRemove);
                logger.debug(
                    `제거된 스토리지 키들: ${keysToRemove.join(", ")}`,
                );
            }

            // 스토리지 사용량 확인
            await this.checkStorageUsage();

            logger.debug("불필요한 스토리지 데이터 정리 완료");
        } catch (error) {
            logger.error("스토리지 데이터 정리 중 오류:", error);
            throw error;
        }
    }

    /**
     * 유지해야 할 스토리지 키들을 반환합니다.
     */
    private getKeysToKeep(): string[] {
        return [
            // 필수 설정 키들
            STORAGE_KEYS.THEME_MODE,
            STORAGE_KEYS.FONT_SIZE,
            STORAGE_KEYS.FONT_WEIGHT,
            STORAGE_KEYS.STYLES_ENABLED,

            // 기타 필수 키들
            "iframeInvisible",
            "cartItems",
            "voim-category-type",

            // 사용자 정보 관련 (필요한 경우)
            "userInfo",
            "allergies",
            "preferences",
        ];
    }

    /**
     * 스토리지 사용량을 확인하고 로그로 출력합니다.
     */
    public async checkStorageUsage(): Promise<void> {
        try {
            const allData = await chrome.storage.local.get(null);
            const totalSize = JSON.stringify(allData).length;
            const keyCount = Object.keys(allData).length;

            logger.debug(
                `스토리지 사용량: ${totalSize} bytes, 키 개수: ${keyCount}`,
            );

            // 사용량이 너무 많으면 경고
            if (totalSize > 100000) {
                // 100KB
                logger.warn(`스토리지 사용량이 많습니다: ${totalSize} bytes`);
            }
        } catch (error) {
            logger.error("스토리지 사용량 확인 중 오류:", error);
        }
    }

    /**
     * 특정 키의 데이터를 정리합니다.
     */
    public async cleanupSpecificKey(key: string): Promise<void> {
        try {
            await chrome.storage.local.remove(key);
            logger.debug(`스토리지 키 제거됨: ${key}`);
        } catch (error) {
            logger.error(`스토리지 키 제거 중 오류: ${key}`, error);
            throw error;
        }
    }

    /**
     * 오래된 임시 데이터를 정리합니다.
     */
    public async cleanupOldTemporaryData(): Promise<void> {
        try {
            logger.debug("오래된 임시 데이터 정리 시작");

            const allData = await chrome.storage.local.get(null);
            const keysToRemove: string[] = [];

            // 임시 데이터 패턴을 가진 키들 찾기
            Object.keys(allData).forEach((key) => {
                if (this.isTemporaryData(key, allData[key])) {
                    keysToRemove.push(key);
                }
            });

            if (keysToRemove.length > 0) {
                await chrome.storage.local.remove(keysToRemove);
                logger.debug(
                    `제거된 임시 데이터 키들: ${keysToRemove.join(", ")}`,
                );
            }

            logger.debug("오래된 임시 데이터 정리 완료");
        } catch (error) {
            logger.error("임시 데이터 정리 중 오류:", error);
            throw error;
        }
    }

    /**
     * 데이터가 임시 데이터인지 확인합니다.
     */
    private isTemporaryData(key: string, value: any): boolean {
        // 임시 데이터 패턴들
        const tempPatterns = [
            /^temp_/,
            /^cache_/,
            /^tmp_/,
            /_temp$/,
            /_cache$/,
            /_tmp$/,
        ];

        // 키 패턴 확인
        const isTempKey = tempPatterns.some((pattern) => pattern.test(key));

        // 값이 객체이고 timestamp가 있으면 오래된 데이터인지 확인
        if (isTempKey && typeof value === "object" && value.timestamp) {
            const age = Date.now() - value.timestamp;
            const maxAge = 24 * 60 * 60 * 1000; // 24시간
            return age > maxAge;
        }

        return isTempKey;
    }

    /**
     * 주기적으로 스토리지 정리를 수행합니다.
     */
    public startPeriodicCleanup(intervalMinutes: number = 60): void {
        setInterval(
            async () => {
                try {
                    await this.cleanupUnnecessaryData();
                    await this.cleanupOldTemporaryData();
                } catch (error) {
                    logger.error("주기적 스토리지 정리 중 오류:", error);
                }
            },
            intervalMinutes * 60 * 1000,
        );

        logger.debug(`주기적 스토리지 정리 시작 (${intervalMinutes}분 간격)`);
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
            logger.debug("StorageCleanupService 정리 시작");

            // 최종 정리 작업 수행
            await this.cleanupUnnecessaryData();

            this.isInitialized = false;

            logger.debug("StorageCleanupService 정리 완료");
        } catch (error) {
            logger.error("StorageCleanupService 정리 중 오류:", error);
            throw error;
        }
    }
}

// 싱글턴 인스턴스 내보내기
export const storageCleanupService = StorageCleanupService.getInstance();
