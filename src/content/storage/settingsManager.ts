import { FontStyle } from "../types";
import { applyFontStyle } from "../styles/fontStyles";
import { applyModeStyle } from "../styles/modeStyles";
import { applyCursorStyle, removeCursorStyle } from "../styles/cursorStyles";
import {
    createIframe,
    removeIframe,
    restoreIframe,
} from "../iframe/iframeManager";
import { removeStyleFromIframes } from "../styles/cursorStyles";
import {
    STORAGE_KEYS,
    DEFAULT_THEME,
    DEFAULT_FONT_SIZE,
    DEFAULT_FONT_WEIGHT,
    EXTENSION_IFRAME_ID,
} from "../../background/constants";
import { fontSizeMap, fontWeightMap, modeStyleMap } from "../constants";
import { FontSizeType, FontWeightType, ModeType } from "../types";

let originalSettings: {
    fontSize?: string;
    fontWeight?: string;
    mode?: string;
} | null = null;
let contentCursorEnabled = true;

/**
 * 확장 프로그램의 상태를 확인하고 적절히 처리합니다.
 */
export function checkExtensionState(): void {
    chrome.storage.local.get([STORAGE_KEYS.STYLES_ENABLED], (result) => {
        const stylesEnabled = result[STORAGE_KEYS.STYLES_ENABLED] ?? true;
        console.log("현재 스타일 활성화 상태:", stylesEnabled);

        if (stylesEnabled) {
            loadAndApplySettings();
            restoreIframe();
        } else {
            ensureStylesRemoved();
            removeIframe();
        }
    });
}

/**
 * 현재 스타일 활성화 상태를 가져옵니다.
 */
export function getStylesEnabledState(
    callback: (enabled: boolean) => void,
): void {
    chrome.storage.local.get([STORAGE_KEYS.STYLES_ENABLED], (result) => {
        const stylesEnabled = result[STORAGE_KEYS.STYLES_ENABLED] ?? true;
        callback(stylesEnabled);
    });
}

/**
 * iframe의 가시성 상태를 확인합니다.
 */
function iframeVisible(): boolean {
    return document.getElementById(EXTENSION_IFRAME_ID) !== null;
}

/**
 * 모든 스타일이 제거되었는지 확인하고 제거합니다.
 */
function ensureStylesRemoved(): void {
    const modeStyle = document.getElementById("webeye-mode-style");
    if (modeStyle) {
        modeStyle.remove();
    }

    const fontStyle = document.getElementById("webeye-global-font-style");
    if (fontStyle) {
        fontStyle.remove();
    }

    const cursorStyle = document.getElementById("custom-cursor-style");
    if (cursorStyle) {
        document.head.removeChild(cursorStyle);
    }

    removeStyleFromIframes();
}

/**
 * 모든 스타일을 제거합니다.
 */
export function removeAllStyles(): void {
    chrome.storage.local.get(
        [
            STORAGE_KEYS.FONT_SIZE,
            STORAGE_KEYS.FONT_WEIGHT,
            STORAGE_KEYS.THEME_MODE,
        ],
        (result) => {
            originalSettings = {
                fontSize: result[STORAGE_KEYS.FONT_SIZE],
                fontWeight: result[STORAGE_KEYS.FONT_WEIGHT],
                mode: result[STORAGE_KEYS.THEME_MODE],
            };

            chrome.storage.local.set(
                { [STORAGE_KEYS.STYLES_ENABLED]: false },
                () => {
                    console.log("스타일 비활성화 상태 저장됨");

                    const elements = document.querySelectorAll("*");
                    elements.forEach((el) => {
                        const htmlEl = el as HTMLElement;
                        if (htmlEl.style) {
                            htmlEl.style.removeProperty("fontSize");
                            htmlEl.style.removeProperty("fontWeight");
                            htmlEl.style.removeProperty("filter");
                            htmlEl.style.removeProperty("backgroundColor");
                        }
                    });

                    const modeStyle =
                        document.getElementById("webeye-mode-style");
                    if (modeStyle) {
                        modeStyle.remove();
                    }

                    const globalFontStyle = document.getElementById(
                        "webeye-global-font-style",
                    );
                    if (globalFontStyle) {
                        globalFontStyle.remove();
                    }

                    const cursorStyle = document.getElementById(
                        "custom-cursor-style",
                    );
                    if (cursorStyle) {
                        document.head.removeChild(cursorStyle);
                    }

                    const fontStyles = document.querySelectorAll(
                        '[style*="font-size"], [style*="font-weight"]',
                    );
                    fontStyles.forEach((el) => {
                        const htmlEl = el as HTMLElement;
                        htmlEl.style.removeProperty("font-size");
                        htmlEl.style.removeProperty("font-weight");
                    });

                    removeStyleFromIframes();
                    removeIframe();

                    checkExtensionState();
                },
            );
        },
    );
}

/**
 * 모든 스타일을 복원합니다.
 */
export function restoreAllStyles(): void {
    chrome.storage.local.set({ [STORAGE_KEYS.STYLES_ENABLED]: true }, () => {
        console.log("스타일 활성화 상태 저장됨");

        chrome.storage.local.get(
            [
                STORAGE_KEYS.FONT_SIZE,
                STORAGE_KEYS.FONT_WEIGHT,
                STORAGE_KEYS.THEME_MODE,
            ],
            (result) => {
                console.log("Restore Settings Result:", result);
                const settings = {
                    fontSize:
                        result[STORAGE_KEYS.FONT_SIZE] ??
                        originalSettings?.fontSize ??
                        DEFAULT_FONT_SIZE,
                    fontWeight:
                        result[STORAGE_KEYS.FONT_WEIGHT] ??
                        originalSettings?.fontWeight ??
                        DEFAULT_FONT_WEIGHT,
                    mode:
                        result[STORAGE_KEYS.THEME_MODE] ??
                        originalSettings?.mode ??
                        DEFAULT_THEME,
                };

                const fontSizePixel =
                    fontSizeMap[
                        `SET_FONT_SIZE_${settings.fontSize.toUpperCase()}` as FontSizeType
                    ];
                const fontWeightPixel =
                    fontWeightMap[
                        `SET_FONT_WEIGHT_${settings.fontWeight.toUpperCase()}` as FontWeightType
                    ];
                const modeMessageType =
                    `SET_MODE_${settings.mode.toUpperCase()}` as ModeType;

                setTimeout(() => {
                    if (modeMessageType) {
                        applyModeStyle(modeMessageType);
                    }

                    const fontStyle: Partial<FontStyle> = {};
                    if (fontSizePixel) fontStyle.fontSize = fontSizePixel;
                    if (fontWeightPixel) fontStyle.fontWeight = fontWeightPixel;
                    if (Object.keys(fontStyle).length) {
                        applyFontStyle(fontStyle);
                    }

                    chrome.storage.local.get(["iframeInvisible"], (result) => {
                        const isInvisible = result.iframeInvisible ?? false;

                        if (isInvisible) {
                            chrome.storage.local.set(
                                { iframeInvisible: false },
                                () => {
                                    restoreIframe();
                                },
                            );
                        } else {
                            restoreIframe();
                        }
                    });

                    checkExtensionState();
                }, 100);
            },
        );

        chrome.runtime.sendMessage(
            { type: "GET_CURSOR_SETTINGS" },
            (response) => {
                if (
                    response &&
                    response.isCursorEnabled &&
                    response.cursorUrl
                ) {
                    applyCursorStyle(response.cursorUrl);
                    contentCursorEnabled = true;
                }
            },
        );
    });
}

/**
 * 사용자 설정을 저장합니다.
 * @param settings 저장할 설정 객체
 */
export function saveSettings(settings: {
    fontSize?: string;
    fontWeight?: string;
    mode?: string;
    cursorTheme?: string;
    cursorSize?: string;
    isCursorEnabled?: boolean;
}): void {
    const updates: Record<string, any> = {};
    if (settings.fontSize) updates[STORAGE_KEYS.FONT_SIZE] = settings.fontSize;
    if (settings.fontWeight)
        updates[STORAGE_KEYS.FONT_WEIGHT] = settings.fontWeight;
    if (settings.mode) updates[STORAGE_KEYS.THEME_MODE] = settings.mode;
    if (settings.cursorTheme)
        updates[STORAGE_KEYS.CURSOR_THEME] = settings.cursorTheme;
    if (settings.cursorSize)
        updates[STORAGE_KEYS.CURSOR_SIZE] = settings.cursorSize;
    if (settings.isCursorEnabled !== undefined)
        updates[STORAGE_KEYS.IS_CURSOR_ENABLED] = settings.isCursorEnabled;

    chrome.storage.local.set(updates, () => {
        console.log("Settings saved:", updates);

        // 커서 설정이 변경된 경우 즉시 적용
        if (
            settings.cursorTheme ||
            settings.cursorSize ||
            settings.isCursorEnabled !== undefined
        ) {
            // 첫 번째 요청
            chrome.runtime.sendMessage(
                { type: "GET_CURSOR_SETTINGS" },
                (response) => {
                    if (response) {
                        contentCursorEnabled = response.isCursorEnabled;

                        if (contentCursorEnabled && response.cursorUrl) {
                            applyCursorStyle(response.cursorUrl);
                        } else {
                            removeCursorStyle();
                        }
                    }
                },
            );

            // 두 번째 요청 (100ms 후)
            setTimeout(() => {
                chrome.runtime.sendMessage(
                    { type: "GET_CURSOR_SETTINGS" },
                    (response) => {
                        if (response) {
                            contentCursorEnabled = response.isCursorEnabled;

                            if (contentCursorEnabled && response.cursorUrl) {
                                applyCursorStyle(response.cursorUrl);
                            } else {
                                removeCursorStyle();
                            }
                        }
                    },
                );
            }, 100);
        }
    });
}

/**
 * 설정을 로드하고 페이지에 적용합니다.
 */
export function loadAndApplySettings(): void {
    chrome.storage.local.get(
        [
            STORAGE_KEYS.FONT_SIZE,
            STORAGE_KEYS.FONT_WEIGHT,
            STORAGE_KEYS.THEME_MODE,
            STORAGE_KEYS.STYLES_ENABLED,
        ],
        (result) => {
            const stylesEnabled = result[STORAGE_KEYS.STYLES_ENABLED] ?? true;

            console.log(
                "Loaded settings:",
                result,
                "Styles enabled:",
                stylesEnabled,
            );

            if (!stylesEnabled) {
                console.log(
                    "스타일이 비활성화 상태입니다. 설정을 적용하지 않습니다.",
                );
                return;
            }

            const fontSize =
                result[STORAGE_KEYS.FONT_SIZE] ?? DEFAULT_FONT_SIZE;
            const fontWeight =
                result[STORAGE_KEYS.FONT_WEIGHT] ?? DEFAULT_FONT_WEIGHT;
            const themeMode = result[STORAGE_KEYS.THEME_MODE] ?? DEFAULT_THEME;

            const fontSizePixel =
                fontSizeMap[
                    `SET_FONT_SIZE_${fontSize.toUpperCase()}` as FontSizeType
                ];
            const fontWeightPixel =
                fontWeightMap[
                    `SET_FONT_WEIGHT_${fontWeight.toUpperCase()}` as FontWeightType
                ];
            const modeMessageType =
                `SET_MODE_${themeMode.toUpperCase()}` as ModeType;

            if (modeMessageType) {
                applyModeStyle(modeMessageType);
            }

            const fontStyle: Partial<FontStyle> = {
                fontSize: fontSizePixel,
                fontWeight: fontWeightPixel,
            };

            if (fontStyle.fontSize || fontStyle.fontWeight) {
                applyFontStyle(fontStyle);
            }
        },
    );
}

/**
 * 커서 설정을 초기화합니다.
 */
export function initCursorSettings(): void {
    contentCursorEnabled = true;

    chrome.storage.local.get([STORAGE_KEYS.STYLES_ENABLED], (result) => {
        const stylesEnabled = result[STORAGE_KEYS.STYLES_ENABLED] ?? true;

        if (!stylesEnabled) {
            console.log(
                "스타일이 비활성화 상태입니다. 커서 설정을 적용하지 않습니다.",
            );
            return;
        }

        chrome.runtime.sendMessage(
            { type: "GET_CURSOR_SETTINGS" },
            (response) => {
                if (response) {
                    contentCursorEnabled = response.isCursorEnabled;

                    if (contentCursorEnabled && response.cursorUrl) {
                        applyCursorStyle(response.cursorUrl);
                    } else {
                        removeCursorStyle();
                    }
                }
            },
        );
    });
}
