import { STORAGE_KEYS } from "../constants";

import { storageService } from "../services/storageService";

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
            changes[STORAGE_KEYS.THEME_MODE]
        ) {
            storageService.handleStorageChanges(changes);
            needsUpdate = true;
        }
    });
}
