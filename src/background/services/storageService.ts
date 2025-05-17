import { SavedSettings, UserSettings } from "../types";
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
            const result = await chrome.storage.sync.get([
                STORAGE_KEYS.CURSOR_THEME,
                STORAGE_KEYS.CURSOR_SIZE,
                STORAGE_KEYS.IS_CURSOR_ENABLED,
                STORAGE_KEYS.USER_SETTINGS,
            ]);

            this.savedSettings = {
                userSettings: result[
                    STORAGE_KEYS.USER_SETTINGS
                ] as UserSettings,
                isCursorEnabled: result[
                    STORAGE_KEYS.IS_CURSOR_ENABLED
                ] as boolean,
            };

            return this.savedSettings;
        } catch (error) {
            logger.error("초기 설정 로드 중 오류:", error);

            return {
                userSettings: {
                    fontSize: DEFAULT_FONT_SIZE,
                    fontWeight: DEFAULT_FONT_WEIGHT,
                    mode: `SET_MODE_${DEFAULT_THEME.toUpperCase()}`,
                },
                isCursorEnabled: DEFAULT_CURSOR_ENABLED,
            };
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
            await chrome.storage.sync.set({
                [STORAGE_KEYS.THEME_MODE]: DEFAULT_THEME,
                [STORAGE_KEYS.FONT_SIZE]: DEFAULT_FONT_SIZE,
                [STORAGE_KEYS.FONT_WEIGHT]: DEFAULT_FONT_WEIGHT,

                [STORAGE_KEYS.CURSOR_THEME]: DEFAULT_CURSOR_THEME,
                [STORAGE_KEYS.CURSOR_SIZE]: DEFAULT_CURSOR_SIZE,
                [STORAGE_KEYS.IS_CURSOR_ENABLED]: DEFAULT_CURSOR_ENABLED,
            });

            this.savedSettings = {
                userSettings: {
                    fontSize: DEFAULT_FONT_SIZE,
                    fontWeight: DEFAULT_FONT_WEIGHT,
                    mode: `SET_MODE_${DEFAULT_THEME.toUpperCase()}`,
                },
                isCursorEnabled: DEFAULT_CURSOR_ENABLED,
            };

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
        let needsUpdate = false;

        if (this.savedSettings === null) {
            this.savedSettings = {
                userSettings: {},
                isCursorEnabled: DEFAULT_CURSOR_ENABLED,
            };
        }

        if (changes[STORAGE_KEYS.USER_SETTINGS]) {
            this.savedSettings.userSettings =
                changes[STORAGE_KEYS.USER_SETTINGS].newValue;
            needsUpdate = true;
        }

        if (changes[STORAGE_KEYS.IS_CURSOR_ENABLED] !== undefined) {
            this.savedSettings.isCursorEnabled =
                changes[STORAGE_KEYS.IS_CURSOR_ENABLED].newValue;
            needsUpdate = true;
        }

        if (needsUpdate) {
            logger.debug("설정이 변경되었습니다:", this.savedSettings);
        }
    }
}

export const storageService = new StorageService();
