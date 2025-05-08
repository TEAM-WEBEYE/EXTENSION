import { logger } from "@src/utils/logger";
import { STORAGE_KEYS } from "../constants";
import { cursorService } from "../services/cursorService";
import { storageService } from "../services/storageService";

/**
 * 스토리지 변경 리스너 초기화
 */
export function initStorageListeners(): void {
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === "sync") {
            let needsUpdate = false;

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

            if (changes[STORAGE_KEYS.IS_CURSOR_ENABLED] !== undefined) {
                cursorService.setCursorEnabled(
                    changes[STORAGE_KEYS.IS_CURSOR_ENABLED].newValue,
                );
                needsUpdate = true;
            }

            if (changes[STORAGE_KEYS.USER_SETTINGS]) {
                storageService.handleStorageChanges(changes);
                needsUpdate = true;
            }

            if (needsUpdate) {
                logger.debug("스토리지 변경 감지, 모든 탭 업데이트");
                cursorService.updateAllTabs();
            }
        }
    });
}
