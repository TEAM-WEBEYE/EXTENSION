import { MessageType, FontSizeType, FontWeightType, ModeType } from "./types";
import { fontSizeMap, fontWeightMap } from "./constants";
import {
    applyFontStyle,
    applyModeStyle,
    applyCursorStyle,
    removeCursorStyle,
} from "./styles";
import {
    checkExtensionState,
    removeAllStyles,
    restoreAllStyles,
    saveSettings,
    loadAndApplySettings,
    initCursorSettings,
    getStylesEnabledState,
} from "./storage/settingsManager";
import { initDomObserver } from "./observers/domObserver";

let contentCursorEnabled = true;

checkExtensionState();

document.addEventListener("DOMContentLoaded", () => {
    checkExtensionState();
});

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        checkExtensionState();
    }
});

initCursorSettings();

const observer = initDomObserver(() => {
    let isStylesEnabled = true;
    chrome.storage.sync.get(["stylesEnabled"], (result) => {
        isStylesEnabled =
            result.stylesEnabled !== undefined ? result.stylesEnabled : true;
    });
    return isStylesEnabled;
});

chrome.runtime.onMessage.addListener(
    (message: { type: MessageType; settings?: any }, sender, sendResponse) => {
        const { type } = message;

        console.log("메시지 수신:", type);

        chrome.storage.sync.get(["stylesEnabled"], (result) => {
            const stylesEnabled =
                result.stylesEnabled !== undefined
                    ? result.stylesEnabled
                    : true;

            if (
                !stylesEnabled &&
                type !== "RESTORE_ALL_STYLES" &&
                type !== "DISABLE_ALL_STYLES"
            ) {
                console.log(
                    "스타일이 비활성화 상태입니다. 메시지를 처리하지 않습니다:",
                    type,
                );
                sendResponse({
                    success: false,
                    error: "스타일이 비활성화 상태입니다",
                });
                return;
            }

            if (Object.keys(fontSizeMap).includes(type as string)) {
                const fontSizeType = type as FontSizeType;
                const fontSize = fontSizeMap[fontSizeType];
                applyFontStyle({ fontSize });
                saveSettings({ fontSize });
                sendResponse({ success: true });
            } else if (Object.keys(fontWeightMap).includes(type as string)) {
                const fontWeightType = type as FontWeightType;
                const fontWeight = fontWeightMap[fontWeightType];
                applyFontStyle({ fontWeight });
                saveSettings({ fontWeight });
                sendResponse({ success: true });
            } else if (type === "SET_MODE_LIGHT" || type === "SET_MODE_DARK") {
                const modeType = type as ModeType;
                applyModeStyle(modeType);
                saveSettings({ mode: modeType });
                sendResponse({ success: true });
            } else if (type === "DISABLE_ALL_STYLES") {
                removeAllStyles();
                sendResponse({ success: true });
            } else if (type === "RESTORE_ALL_STYLES") {
                restoreAllStyles();
                sendResponse({ success: true });
            } else {
                sendResponse({ success: false, error: "알 수 없는 메시지" });
            }
        });

        return true;
    },
);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "UPDATE_CURSOR") {
        chrome.storage.sync.get(["stylesEnabled"], (result) => {
            const stylesEnabled =
                result.stylesEnabled !== undefined
                    ? result.stylesEnabled
                    : true;

            if (!stylesEnabled) {
                console.log(
                    "스타일이 비활성화 상태입니다. 커서 설정을 적용하지 않습니다.",
                );
                sendResponse({
                    success: false,
                    error: "스타일이 비활성화 상태입니다",
                });
                return;
            }

            if (message.isCursorEnabled && message.cursorUrl) {
                applyCursorStyle(message.cursorUrl);
                contentCursorEnabled = true;
            } else {
                removeCursorStyle();
                contentCursorEnabled = false;
            }

            sendResponse({ success: true });
        });
        return true;
    }
    return false;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "TOGGLE_MODAL") {
        chrome.storage.sync.get(["stylesEnabled"], (result) => {
            const stylesEnabled =
                result.stylesEnabled !== undefined
                    ? result.stylesEnabled
                    : true;

            const iframe = document.getElementById(
                "floating-button-extension-iframe",
            );
            if (iframe instanceof HTMLIFrameElement && iframe.contentWindow) {
                iframe.contentWindow.postMessage({ type: "TOGGLE_MODAL" }, "*");
            }
            sendResponse({ success: true });
        });
        return true;
    } else if (message.action === "TOGGLE_CURSOR") {
        chrome.storage.sync.get(["stylesEnabled"], (result) => {
            const stylesEnabled =
                result.stylesEnabled !== undefined
                    ? result.stylesEnabled
                    : true;

            if (!stylesEnabled) {
                console.log(
                    "스타일이 비활성화 상태입니다. 커서 토글을 적용하지 않습니다.",
                );
                sendResponse({
                    success: false,
                    error: "스타일이 비활성화 상태입니다",
                });
                return;
            }

            const iframe = document.getElementById(
                "floating-button-extension-iframe",
            );
            if (iframe instanceof HTMLIFrameElement && iframe.contentWindow) {
                iframe.contentWindow.postMessage(
                    { type: "TOGGLE_CURSOR" },
                    "*",
                );
            }
            sendResponse({ success: true });
        });
        return true;
    }

    return false;
});
