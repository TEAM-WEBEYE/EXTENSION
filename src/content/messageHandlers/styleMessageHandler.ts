import { MessageType, FontSizeType, FontWeightType, ModeType } from "../types";
import { fontSizeMap, fontWeightMap } from "../constants";
import { applyFontStyle, applyModeStyle } from "../styles";
import {
    removeAllStyles,
    restoreAllStyles,
    saveFontSize,
    saveFontWeight,
    saveThemeMode,
} from "../storage/settingsManager";

export const handleStyleMessage = (
    message: { type: MessageType; settings?: any },
    sendResponse: (response: any) => void,
) => {
    const { type } = message;

    chrome.storage.sync.get(["stylesEnabled"], (result) => {
        const stylesEnabled =
            result.stylesEnabled !== undefined ? result.stylesEnabled : true;

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
            saveFontSize(fontSize);
            sendResponse({ success: true });
        } else if (Object.keys(fontWeightMap).includes(type as string)) {
            const fontWeightType = type as FontWeightType;
            const fontWeight = fontWeightMap[fontWeightType];
            applyFontStyle({ fontWeight });
            saveFontWeight(fontWeight);
            sendResponse({ success: true });
        } else if (type === "SET_MODE_LIGHT" || type === "SET_MODE_DARK") {
            const modeType = type as ModeType;
            applyModeStyle(modeType);
            saveThemeMode(modeType);
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
};
