import { logger } from "@src/utils/logger";
import { STORAGE_KEYS } from "../constants";
import { cursorService } from "../services/cursorService";
import { themeService } from "../services/themeService";
import { storageService } from "../services/storageService";

/**
 * 스토리지 변경 리스너 초기화
 */
export function initStorageListeners(): void {
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace !== "sync") return;

        let needsCursorUpdate = false;
        let needsThemeUpdate = false;

        // 개별 항목 처리
        if (changes[STORAGE_KEYS.CURSOR_THEME]) {
            cursorService.setCursorTheme(
                changes[STORAGE_KEYS.CURSOR_THEME].newValue,
            );
            needsCursorUpdate = true;
        }

        if (changes[STORAGE_KEYS.CURSOR_SIZE]) {
            cursorService.setCursorSize(
                changes[STORAGE_KEYS.CURSOR_SIZE].newValue,
            );
            needsCursorUpdate = true;
        }

        if (changes[STORAGE_KEYS.IS_CURSOR_ENABLED]) {
            cursorService.setCursorEnabled(
                changes[STORAGE_KEYS.IS_CURSOR_ENABLED].newValue,
            );
            needsCursorUpdate = true;
        }

        if (changes[STORAGE_KEYS.THEME_MODE]) {
            themeService.setTheme(changes[STORAGE_KEYS.THEME_MODE].newValue);
            needsThemeUpdate = true;
        }

        if (changes[STORAGE_KEYS.FONT_SIZE]) {
            themeService.setFontSize(changes[STORAGE_KEYS.FONT_SIZE].newValue);
            needsThemeUpdate = true;
        }

        if (changes[STORAGE_KEYS.FONT_WEIGHT]) {
            themeService.setFontWeight(
                changes[STORAGE_KEYS.FONT_WEIGHT].newValue,
            );
            needsThemeUpdate = true;
        }

        // 내부 캐시 업데이트
        if (
            changes[STORAGE_KEYS.FONT_SIZE] ||
            changes[STORAGE_KEYS.FONT_WEIGHT] ||
            changes[STORAGE_KEYS.THEME_MODE] ||
            changes[STORAGE_KEYS.IS_CURSOR_ENABLED] ||
            changes[STORAGE_KEYS.CURSOR_SIZE] ||
            changes[STORAGE_KEYS.CURSOR_THEME]
        ) {
            storageService.handleStorageChanges(changes);
        }

        // 필요한 경우 UI 반영
        if (needsCursorUpdate) {
            logger.debug("커서 설정 변경 감지됨. 모든 탭 업데이트");
            cursorService.updateAllTabs();
        }

        if (needsThemeUpdate) {
            logger.debug("테마/글꼴 설정 변경 감지됨. 모든 탭 업데이트");
            themeService.updateAllTabs();
        }
    });
}
