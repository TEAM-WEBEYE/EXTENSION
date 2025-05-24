import { MessageType, FontSizeType, FontWeightType, ModeType } from "../types";
import { fontSizeMap, fontWeightMap } from "../constants";
import { applyFontStyle, applyModeStyle } from "../styles";
import {
    removeAllStyles,
    restoreAllStyles,
    saveSettings,
    removeAllStyleSheets,
} from "../storage/settingsManager";
import { STORAGE_KEYS } from "../../background/constants";

export const handleStyleMessage = (
    message: { type: MessageType; settings?: any },
    sendResponse: (response: any) => void,
) => {
    const { type } = message;

    chrome.storage.local.get(["stylesEnabled"], (result) => {
        const stylesEnabled =
            result.stylesEnabled !== undefined ? result.stylesEnabled : true;

        if (
            !stylesEnabled &&
            type !== "RESTORE_ALL_STYLES" &&
            type !== "DISABLE_ALL_STYLES" &&
            type !== "REMOVE_ALL_STYLE_SHEETS"
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
            const fontSizeKeyword = fontSizeType
                .replace("SET_FONT_SIZE_", "")
                .toLowerCase();
            const fontSizePixel = fontSizeMap[fontSizeType];

            chrome.storage.local.set(
                { [STORAGE_KEYS.STYLES_ENABLED]: true },
                () => {
                    applyFontStyle({ fontSize: fontSizePixel });
                    saveSettings({ fontSize: fontSizeKeyword });
                    sendResponse({ success: true });
                },
            );
        } else if (Object.keys(fontWeightMap).includes(type as string)) {
            const fontWeightType = type as FontWeightType;
            const fontWeightKeyword = fontWeightType
                .replace("SET_FONT_WEIGHT_", "")
                .toLowerCase();
            const fontWeightPixel = fontWeightMap[fontWeightType];

            chrome.storage.local.set(
                { [STORAGE_KEYS.STYLES_ENABLED]: true },
                () => {
                    applyFontStyle({ fontWeight: fontWeightPixel });
                    saveSettings({ fontWeight: fontWeightKeyword });
                    sendResponse({ success: true });
                },
            );
        } else if (type === "SET_MODE_LIGHT" || type === "SET_MODE_DARK") {
            const modeType = type as ModeType;
            const modeKeyword = modeType.replace("SET_MODE_", "").toLowerCase();

            chrome.storage.local.set(
                { [STORAGE_KEYS.STYLES_ENABLED]: true },
                () => {
                    applyModeStyle(modeType);
                    saveSettings({ mode: modeKeyword });
                    sendResponse({ success: true });
                },
            );
        } else if (type === "DISABLE_ALL_STYLES") {
            removeAllStyles();
            sendResponse({ success: true });
        } else if (type === "REMOVE_ALL_STYLE_SHEETS") {
            removeAllStyleSheets();
            sendResponse({ success: true });
        } else if (type === "RESTORE_ALL_STYLES") {
            restoreAllStyles();
            sendResponse({ success: true });
        } else {
            sendResponse({ success: false, error: "알 수 없는 메시지" });
        }
    });
};
