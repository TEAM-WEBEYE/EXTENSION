import { initMessageListeners } from "./listeners/messageListeners";
import { initStorageListeners } from "./listeners/storageListeners";
import { initTabListeners } from "./listeners/tabListeners";
import { initCommandListeners } from "./listeners/commandListeners";
import { storageService } from "./services/storageService";
import { cursorService } from "./services/cursorService";
import { logger } from "@src/utils/logger";
import { STORAGE_KEYS } from "./constants";

/**
 * 백그라운드 스크립트 초기화
 */
async function init() {
    try {
        logger.debug("백그라운드 스크립트 초기화 시작");

        initCommandListeners();
        initMessageListeners();
        initStorageListeners();
        initTabListeners();

        logger.debug("모든 리스너가 초기화되었습니다");

        const settings = await storageService.loadInitialSettings();

        const result = await chrome.storage.sync.get([
            STORAGE_KEYS.CURSOR_THEME,
            STORAGE_KEYS.CURSOR_SIZE,
            STORAGE_KEYS.IS_CURSOR_ENABLED,
        ]);

        if (result[STORAGE_KEYS.CURSOR_THEME]) {
            cursorService.setCursorTheme(result[STORAGE_KEYS.CURSOR_THEME]);
        }

        if (result[STORAGE_KEYS.CURSOR_SIZE]) {
            cursorService.setCursorSize(result[STORAGE_KEYS.CURSOR_SIZE]);
        }

        if (result[STORAGE_KEYS.IS_CURSOR_ENABLED] !== undefined) {
            cursorService.setCursorEnabled(
                result[STORAGE_KEYS.IS_CURSOR_ENABLED],
            );
        }

        await cursorService.updateAllTabs();

        chrome.commands.getAll().then((commands) => {
            logger.debug("사용 가능한 명령어:", commands);
        });
    } catch (error) {
        logger.error("백그라운드 스크립트 초기화 오류:", error);
    }
}

init();
