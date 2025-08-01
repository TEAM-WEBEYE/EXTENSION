import { logger } from "@src/utils/logger";
import {
    STORAGE_KEYS,
    DEFAULT_THEME,
    DEFAULT_FONT_SIZE,
    DEFAULT_FONT_WEIGHT,
} from "./constants";
import { initCommandListeners } from "./listeners/commandListeners";
import { initStorageListeners } from "./listeners/storageListeners";
import { handleCommand } from "./listeners/unifiedCommandHandler";
import { serviceManager } from "./services/ServiceManager";
import { messageService } from "./services/MessageService";

/**
 * 백그라운드 스크립트 초기화
 */
async function init() {
    try {
        logger.debug("백그라운드 스크립트 초기화 시작");

        // 싱글턴 서비스 매니저 초기화
        await serviceManager.initialize();

        // 메시지 서비스 초기화
        messageService.initialize();

        // 명령어 리스너 초기화
        initCommandListeners();

        // 스토리지 리스너 초기화
        initStorageListeners();

        logger.debug("모든 서비스가 초기화되었습니다");

        chrome.commands.getAll().then((commands) => {
            logger.debug("사용 가능한 명령어:", commands);
        });
    } catch (error) {
        logger.error("백그라운드 스크립트 초기화 오류:", error);
    }
}

init();

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        const defaultSettings = {
            [STORAGE_KEYS.THEME_MODE]: DEFAULT_THEME,
            [STORAGE_KEYS.FONT_SIZE]: DEFAULT_FONT_SIZE,
            [STORAGE_KEYS.FONT_WEIGHT]: DEFAULT_FONT_WEIGHT,
        };
        chrome.storage.local.set(defaultSettings, () => {
            logger.debug(
                "확장 프로그램 설치됨: 스토리지에 기본 설정 저장 완료",
            );
        });

        chrome.storage.local.set({ iframeInvisible: false }, () => {
            logger.debug("iframe 기본 설정 저장 완료");
        });
    }
});

chrome.action.onClicked.addListener(async (tab) => {
    try {
        logger.debug("툴바 아이콘 클릭됨");
        await handleCommand("toolbar_icon_click");
    } catch (error) {
        logger.error("툴바 아이콘 클릭 처리 중 오류 발생:", error);
    }
});
