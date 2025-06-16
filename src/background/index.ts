import { initMessageListeners } from "./listeners/messageListeners";
import { initStorageListeners } from "./listeners/storageListeners";
import { logger } from "@src/utils/logger";
import {
    STORAGE_KEYS,
    DEFAULT_THEME,
    DEFAULT_FONT_SIZE,
    DEFAULT_FONT_WEIGHT,
} from "./constants";
import { initCommandListeners } from "./listeners/commandListeners";
import { handleIconToggle } from "./listeners/iconHandler";
import {
    handleFoodDataFetch,
    handleImageAnalysisFetch,
    handleOutlineInfoFetch,
    handleCosmeticDataFetch,
    handleReviewSummaryFetch,
    handleHealthDataFetch,
} from "./handlers/api";
import {
    handlePageTypeMessage,
    handleCartPageMessage,
    handleCartItemsUpdated,
    handleVendorHtmlFetch,
    handleProductTitleFetch,
} from "./handlers/pageHandlers";

/**
 * 백그라운드 스크립트 초기화
 */
async function init() {
    try {
        logger.debug("백그라운드 스크립트 초기화 시작");

        initCommandListeners();
        initMessageListeners();
        initStorageListeners();

        logger.debug("모든 리스너가 초기화되었습니다");

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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case "PAGE_TYPE":
            handlePageTypeMessage(message, sender, sendResponse);
            return true;
        case "CART_PAGE":
            handleCartPageMessage(message, sender, sendResponse);
            return true;
        case "CART_ITEMS_UPDATED":
            handleCartItemsUpdated(message, sender, sendResponse);
            return true;
        case "FETCH_FOOD_DATA":
            handleFoodDataFetch(message, sender, sendResponse);
            return true;
        case "FETCH_IMAGE_ANALYSIS":
            handleImageAnalysisFetch(message, sender, sendResponse);
            return true;
        case "FETCH_OUTLINE_INFO":
            handleOutlineInfoFetch(message, sender, sendResponse);
            return true;
        case "FETCH_COSMETIC_DATA":
            handleCosmeticDataFetch(message, sender, sendResponse);
            return true;
        case "FETCH_REVIEW_SUMMARY":
            handleReviewSummaryFetch(message, sender, sendResponse);
            return true;
        case "FETCH_HEALTH_DATA":
            handleHealthDataFetch(message, sender, sendResponse);
            return true;
        case "FETCH_VENDOR_HTML":
            handleVendorHtmlFetch(message, sender, sendResponse);
            return true;
        case "GET_PRODUCT_TITLE":
            handleProductTitleFetch(message, sender, sendResponse);
            return true;
        default:
            return false;
    }
});

chrome.action.onClicked.addListener(async (tab) => {
    try {
        logger.debug("툴바 아이콘 클릭됨");
        await handleIconToggle();
    } catch (error) {
        logger.error("툴바 아이콘 클릭 처리 중 오류 발생:", error);
    }
});
