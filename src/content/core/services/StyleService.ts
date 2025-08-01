import { logger } from "@src/utils/logger";
import { STORAGE_KEYS } from "../../../background/constants";
import {
    loadAndApplySettings,
    removeAllStyles,
    restoreAllStyles,
} from "../storage/settingsManager";

/**
 * 스타일 관련 서비스 (싱글턴)
 * Content script의 스타일 관리를 담당합니다.
 */
class StyleService {
    private static instance: StyleService;
    private isInitialized: boolean = false;

    private constructor() {
        // private constructor to prevent direct instantiation
    }

    /**
     * 싱글턴 인스턴스를 반환합니다.
     */
    public static getInstance(): StyleService {
        if (!StyleService.instance) {
            StyleService.instance = new StyleService();
        }
        return StyleService.instance;
    }

    /**
     * 서비스를 초기화합니다.
     */
    public async initialize(): Promise<void> {
        if (this.isInitialized) {
            logger.debug("StyleService가 이미 초기화되었습니다.");
            return;
        }

        try {
            logger.debug("StyleService 초기화 시작");
            this.isInitialized = true;
            logger.debug("StyleService 초기화 완료");
        } catch (error) {
            logger.error("StyleService 초기화 중 오류:", error);
            throw error;
        }
    }

    /**
     * 모든 스타일을 비활성화합니다.
     */
    public async disableAllStyles(): Promise<void> {
        try {
            logger.debug("모든 스타일 비활성화 시작");
            removeAllStyles();
            logger.debug("모든 스타일 비활성화 완료");
        } catch (error) {
            logger.error("스타일 비활성화 중 오류:", error);
            throw error;
        }
    }

    /**
     * 모든 스타일을 복원합니다.
     */
    public async restoreAllStyles(settings?: any): Promise<void> {
        try {
            logger.debug("모든 스타일 복원 시작");
            restoreAllStyles();
            logger.debug("모든 스타일 복원 완료");
        } catch (error) {
            logger.error("스타일 복원 중 오류:", error);
            throw error;
        }
    }

    /**
     * 현재 저장된 설정을 웹사이트에 즉시 적용합니다.
     */
    public async applyCurrentSettings(): Promise<void> {
        try {
            logger.debug("현재 설정을 웹사이트에 적용 시작");
            loadAndApplySettings();
            logger.debug("현재 설정을 웹사이트에 적용 완료");
        } catch (error) {
            logger.error("설정 적용 중 오류:", error);
            throw error;
        }
    }

    /**
     * 모드를 설정합니다.
     */
    public async setMode(mode: string): Promise<void> {
        try {
            logger.debug(`모드 설정: ${mode}`);

            // 스토리지에 모드 설정 저장
            await chrome.storage.local.set({ [STORAGE_KEYS.THEME_MODE]: mode });

            // 즉시 적용
            await this.applyCurrentSettings();
            logger.debug("모드 설정 완료");
        } catch (error) {
            logger.error("모드 설정 중 오류:", error);
            throw error;
        }
    }

    /**
     * 폰트 크기를 설정합니다.
     */
    public async setFontSize(size: string): Promise<void> {
        try {
            logger.debug(`폰트 크기 설정: ${size}`);

            // 스토리지에 폰트 크기 설정 저장
            await chrome.storage.local.set({ [STORAGE_KEYS.FONT_SIZE]: size });

            // 즉시 적용
            await this.applyCurrentSettings();
            logger.debug("폰트 크기 설정 완료");
        } catch (error) {
            logger.error("폰트 크기 설정 중 오류:", error);
            throw error;
        }
    }

    /**
     * 폰트 굵기를 설정합니다.
     */
    public async setFontWeight(weight: string): Promise<void> {
        try {
            logger.debug(`폰트 굵기 설정: ${weight}`);

            // 스토리지에 폰트 굵기 설정 저장
            await chrome.storage.local.set({
                [STORAGE_KEYS.FONT_WEIGHT]: weight,
            });

            // 즉시 적용
            await this.applyCurrentSettings();
            logger.debug("폰트 굵기 설정 완료");
        } catch (error) {
            logger.error("폰트 굵기 설정 중 오류:", error);
            throw error;
        }
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
            logger.debug("StyleService 정리 시작");
            this.isInitialized = false;
            logger.debug("StyleService 정리 완료");
        } catch (error) {
            logger.error("StyleService 정리 중 오류:", error);
            throw error;
        }
    }
}

// 싱글턴 인스턴스 내보내기
export const styleService = StyleService.getInstance();
