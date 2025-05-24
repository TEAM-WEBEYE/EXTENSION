import { SavedSettings } from "../types";
import {
    DEFAULT_CURSOR_ENABLED,
    DEFAULT_CURSOR_SIZE,
    DEFAULT_CURSOR_THEME,
    DEFAULT_FONT_SIZE,
    DEFAULT_FONT_WEIGHT,
    DEFAULT_THEME,
    STORAGE_KEYS,
} from "../constants";
import { logger } from "@src/utils/logger";

export const DEFAULT_SETTINGS: SavedSettings = {
    fontSize: DEFAULT_FONT_SIZE,
    fontWeight: DEFAULT_FONT_WEIGHT,
    themeMode: DEFAULT_THEME,
    isCursorEnabled: DEFAULT_CURSOR_ENABLED,
};

/**
 * 스토리지 관련 서비스
 */
class StorageService {
    private savedSettings: SavedSettings | null = null;

    /**
     * 초기 설정을 로드합니다.
     */
    async loadInitialSettings(): Promise<SavedSettings> {
        try {
            const result = await chrome.storage.local.get([
                STORAGE_KEYS.CURSOR_THEME,
                STORAGE_KEYS.CURSOR_SIZE,
                STORAGE_KEYS.IS_CURSOR_ENABLED,
                STORAGE_KEYS.FONT_SIZE,
                STORAGE_KEYS.FONT_WEIGHT,
                STORAGE_KEYS.THEME_MODE,
            ]);

            this.savedSettings = {
                fontSize: result[STORAGE_KEYS.FONT_SIZE] as string,
                fontWeight: result[STORAGE_KEYS.FONT_WEIGHT] as string,
                themeMode: result[STORAGE_KEYS.THEME_MODE] as string,
                isCursorEnabled: result[
                    STORAGE_KEYS.IS_CURSOR_ENABLED
                ] as boolean,
            };

            return this.savedSettings;
        } catch (error) {
            logger.error("초기 설정 로드 중 오류:", error);
            return DEFAULT_SETTINGS;
        }
    }

    /**
     * 현재 저장된 설정을 반환합니다.
     */
    getSavedSettings(): SavedSettings | null {
        return this.savedSettings;
    }

    /**
     * 설정을 저장합니다.
     */
    setSavedSettings(settings: SavedSettings): void {
        this.savedSettings = settings;
    }

    /**
     * 모든 설정을 기본값으로 초기화합니다.
     */
    async resetAllSettings(): Promise<void> {
        try {
            const defaultStorageValues = {
                [STORAGE_KEYS.THEME_MODE]: DEFAULT_THEME,
                [STORAGE_KEYS.FONT_SIZE]: DEFAULT_FONT_SIZE,
                [STORAGE_KEYS.FONT_WEIGHT]: DEFAULT_FONT_WEIGHT,
                [STORAGE_KEYS.CURSOR_THEME]: DEFAULT_CURSOR_THEME,
                [STORAGE_KEYS.CURSOR_SIZE]: DEFAULT_CURSOR_SIZE,
                [STORAGE_KEYS.IS_CURSOR_ENABLED]: DEFAULT_CURSOR_ENABLED,
            };

            await chrome.storage.local.set(defaultStorageValues);
            this.savedSettings = DEFAULT_SETTINGS;

            logger.debug("모든 설정이 초기화되었습니다.");
        } catch (error) {
            logger.error("설정 초기화 중 오류:", error);
            throw error;
        }
    }

    /**
     * 스토리지 변경을 처리합니다.
     */
    handleStorageChanges(changes: {
        [key: string]: chrome.storage.StorageChange;
    }): void {
        if (this.savedSettings === null) {
            this.savedSettings = DEFAULT_SETTINGS;
        }

        const updatedSettings = { ...this.savedSettings };
        let needsUpdate = false;

        if (changes[STORAGE_KEYS.FONT_SIZE]) {
            updatedSettings.fontSize = changes[STORAGE_KEYS.FONT_SIZE].newValue;
            needsUpdate = true;
        }

        if (changes[STORAGE_KEYS.FONT_WEIGHT]) {
            updatedSettings.fontWeight =
                changes[STORAGE_KEYS.FONT_WEIGHT].newValue;
            needsUpdate = true;
        }

        if (changes[STORAGE_KEYS.THEME_MODE]) {
            updatedSettings.themeMode =
                changes[STORAGE_KEYS.THEME_MODE].newValue;
            needsUpdate = true;
        }

        if (changes[STORAGE_KEYS.IS_CURSOR_ENABLED] !== undefined) {
            updatedSettings.isCursorEnabled =
                changes[STORAGE_KEYS.IS_CURSOR_ENABLED].newValue;
            needsUpdate = true;
        }

        if (needsUpdate) {
            this.savedSettings = updatedSettings;
            logger.debug("설정이 변경되었습니다:", this.savedSettings);
        }
    }
}

export const storageService = new StorageService();
