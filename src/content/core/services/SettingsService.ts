import { logger } from "@src/utils/logger";
import { loadAndApplySettings } from "../storage/settingsManager";

/**
 * Content script용 설정 서비스
 */
class SettingsService {
    private isInitialized: boolean = false;

    /**
     * 서비스를 초기화합니다.
     */
    public async initialize(): Promise<void> {
        try {
            this.isInitialized = true;
            logger.debug("Content SettingsService 초기화 완료");
        } catch (error) {
            logger.error("Content SettingsService 초기화 중 오류:", error);
            throw error;
        }
    }

    /**
     * 모든 설정을 초기화합니다.
     */
    public async resetSettings(): Promise<void> {
        try {
            logger.debug("설정 초기화 시작");

            // 모든 스타일 제거
            await loadAndApplySettings();

            logger.debug("설정 초기화 완료");
        } catch (error) {
            logger.error("설정 초기화 중 오류:", error);
            throw error;
        }
    }

    /**
     * 서비스가 초기화되었는지 확인합니다.
     */
    public isReady(): boolean {
        return this.isInitialized;
    }
}

export const settingsService = new SettingsService();
