import { logger } from "@src/utils/logger";
import { STORAGE_KEYS } from "../constants";

import { storageService } from "../services/storageService";
import { cursorService } from "../services/cursorService";

/**
 * 스토리지 변경 리스너를 초기화합니다.
 */
export function initStorageListeners(): void {
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName !== "local") return;

        let needsUpdate = false;

        if (
            changes[STORAGE_KEYS.FONT_SIZE] ||
            changes[STORAGE_KEYS.FONT_WEIGHT] ||
            changes[STORAGE_KEYS.THEME_MODE] ||
            changes[STORAGE_KEYS.IS_CURSOR_ENABLED]
        ) {
            storageService.handleStorageChanges(changes);
            needsUpdate = true;
        }

        // 커서 관련 설정 변경 감지 및 cursorService 업데이트
        if (changes[STORAGE_KEYS.CURSOR_THEME]) {
            cursorService.setCursorTheme(
                changes[STORAGE_KEYS.CURSOR_THEME].newValue,
            );
            needsUpdate = true;
        }

        if (changes[STORAGE_KEYS.CURSOR_SIZE]) {
            cursorService.setCursorSize(
                changes[STORAGE_KEYS.CURSOR_SIZE].newValue,
            );
            needsUpdate = true;
        }

        // 커서 활성화 상태 변경 감지는 이미 위에서 처리됨 (storageService.handleStorageChanges 내부)

        if (needsUpdate) {
            logger.debug("스토리지 변경 감지됨:", changes);
            // 모든 탭에 커서 상태 업데이트 메시지 전송
            cursorService.updateAllTabs();
        }
    });
}
