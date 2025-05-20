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
    private savedSettings: {
        fontSize: string;
        fontWeight: string;
        themeMode: string;
        isCursorEnabled: boolean;
        cursorSize: string;
        cursorTheme: string;
        iframeVisible: boolean;
    } | null = null;

    /**
     * 초기 설정을 로드합니다.
     */
    async loadInitialSettings() {
        try {
            const result = await chrome.storage.sync.get([
                STORAGE_KEYS.FONT_SIZE,
                STORAGE_KEYS.FONT_WEIGHT,
                STORAGE_KEYS.THEME_MODE,
                STORAGE_KEYS.IS_CURSOR_ENABLED,
                STORAGE_KEYS.CURSOR_SIZE,
                STORAGE_KEYS.CURSOR_THEME,
                STORAGE_KEYS.IFRAME_VISIBLE,
            ]);

            this.savedSettings = {
                fontSize: result[STORAGE_KEYS.FONT_SIZE] || DEFAULT_FONT_SIZE,
                fontWeight:
                    result[STORAGE_KEYS.FONT_WEIGHT] || DEFAULT_FONT_WEIGHT,
                themeMode:
                    result[STORAGE_KEYS.THEME_MODE] ||
                    `SET_MODE_${DEFAULT_THEME.toUpperCase()}`,
                isCursorEnabled:
                    result[STORAGE_KEYS.IS_CURSOR_ENABLED] ??
                    DEFAULT_CURSOR_ENABLED,
                cursorSize:
                    result[STORAGE_KEYS.CURSOR_SIZE] || DEFAULT_CURSOR_SIZE,
                cursorTheme:
                    result[STORAGE_KEYS.CURSOR_THEME] || DEFAULT_CURSOR_THEME,
                iframeVisible: result[STORAGE_KEYS.IFRAME_VISIBLE] ?? true,
            };

            return this.savedSettings;
        } catch (error) {
            logger.error("초기 설정 로드 중 오류:", error);

            this.savedSettings = {
                fontSize: DEFAULT_FONT_SIZE,
                fontWeight: DEFAULT_FONT_WEIGHT,
                themeMode: `SET_MODE_${DEFAULT_THEME.toUpperCase()}`,
                isCursorEnabled: DEFAULT_CURSOR_ENABLED,
                cursorSize: DEFAULT_CURSOR_SIZE,
                cursorTheme: DEFAULT_CURSOR_THEME,
                iframeVisible: true,
            };

            return this.savedSettings;
        }
    }

    /**
     * 현재 저장된 설정을 반환합니다.
     */
    getSavedSettings() {
        return this.savedSettings;
    }

    /**
     * 설정을 저장합니다.
     */
    setSavedSettings(settings: typeof this.savedSettings): void {
        this.savedSettings = settings;
    }

    /**
     * 모든 설정을 기본값으로 초기화합니다.
     */
    async resetAllSettings(): Promise<void> {
        try {
            await chrome.storage.sync.set({
                [STORAGE_KEYS.FONT_SIZE]: DEFAULT_FONT_SIZE,
                [STORAGE_KEYS.FONT_WEIGHT]: DEFAULT_FONT_WEIGHT,
                [STORAGE_KEYS.THEME_MODE]: `SET_MODE_${DEFAULT_THEME.toUpperCase()}`,
                [STORAGE_KEYS.IS_CURSOR_ENABLED]: DEFAULT_CURSOR_ENABLED,
                [STORAGE_KEYS.CURSOR_SIZE]: DEFAULT_CURSOR_SIZE,
                [STORAGE_KEYS.CURSOR_THEME]: DEFAULT_CURSOR_THEME,
                [STORAGE_KEYS.IFRAME_VISIBLE]: true,
            });

            this.savedSettings = {
                fontSize: DEFAULT_FONT_SIZE,
                fontWeight: DEFAULT_FONT_WEIGHT,
                themeMode: `SET_MODE_${DEFAULT_THEME.toUpperCase()}`,
                isCursorEnabled: DEFAULT_CURSOR_ENABLED,
                cursorSize: DEFAULT_CURSOR_SIZE,
                cursorTheme: DEFAULT_CURSOR_THEME,
                iframeVisible: true,
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
        if (this.savedSettings === null) {
            this.savedSettings = {
                fontSize: DEFAULT_FONT_SIZE,
                fontWeight: DEFAULT_FONT_WEIGHT,
                themeMode: `SET_MODE_${DEFAULT_THEME.toUpperCase()}`,
                isCursorEnabled: DEFAULT_CURSOR_ENABLED,
                cursorSize: DEFAULT_CURSOR_SIZE,
                cursorTheme: DEFAULT_CURSOR_THEME,
                iframeVisible: true,
            };
        }

        let needsUpdate = false;

        if (changes[STORAGE_KEYS.FONT_SIZE]) {
            this.savedSettings.fontSize =
                changes[STORAGE_KEYS.FONT_SIZE].newValue;
            needsUpdate = true;
        }

        if (changes[STORAGE_KEYS.FONT_WEIGHT]) {
            this.savedSettings.fontWeight =
                changes[STORAGE_KEYS.FONT_WEIGHT].newValue;
            needsUpdate = true;
        }

        if (changes[STORAGE_KEYS.THEME_MODE]) {
            this.savedSettings.themeMode =
                changes[STORAGE_KEYS.THEME_MODE].newValue;
            needsUpdate = true;
        }

        if (changes[STORAGE_KEYS.IS_CURSOR_ENABLED]) {
            this.savedSettings.isCursorEnabled =
                changes[STORAGE_KEYS.IS_CURSOR_ENABLED].newValue;
            needsUpdate = true;
        }

        if (changes[STORAGE_KEYS.CURSOR_SIZE]) {
            this.savedSettings.cursorSize =
                changes[STORAGE_KEYS.CURSOR_SIZE].newValue;
            needsUpdate = true;
        }

        if (changes[STORAGE_KEYS.CURSOR_THEME]) {
            this.savedSettings.cursorTheme =
                changes[STORAGE_KEYS.CURSOR_THEME].newValue;
            needsUpdate = true;
        }

        if (changes[STORAGE_KEYS.IFRAME_VISIBLE]) {
            this.savedSettings.iframeVisible =
                changes[STORAGE_KEYS.IFRAME_VISIBLE].newValue;
            needsUpdate = true;
        }

        if (needsUpdate) {
            logger.debug("설정이 변경되었습니다:", this.savedSettings);
        }
    }
}

export const storageService = new StorageService();
