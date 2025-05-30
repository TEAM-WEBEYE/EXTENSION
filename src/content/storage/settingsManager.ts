import { FontStyle } from "../types";
import { applyFontStyle } from "../styles/fontStyles";
import { applyModeStyle } from "../styles/modeStyles";
import {
    createIframe,
    removeIframe,
    restoreIframe,
} from "../iframe/iframeManager";
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

/**
 * 확장 프로그램의 상태를 확인하고 적절히 처리합니다.
 */
export function checkExtensionState(): void {
    chrome.storage.local.get(
        [STORAGE_KEYS.STYLES_ENABLED, "iframeInvisible"],
        (result) => {
            const stylesEnabled = result[STORAGE_KEYS.STYLES_ENABLED] ?? true;
            const iframeInvisible = result.iframeInvisible ?? false;
            const iframeExists =
                document.getElementById(EXTENSION_IFRAME_ID) !== null;

            if (stylesEnabled) {
                loadAndApplySettings();
                if (iframeInvisible && iframeExists) {
                    removeIframe();
                } else if (!iframeInvisible && !iframeExists) {
                    restoreIframe();
                }
            } else {
                ensureStylesRemoved();
                if (iframeInvisible && iframeExists) {
                    removeIframe();
                } else if (!iframeInvisible && !iframeExists) {
                    restoreIframe();
                }
            }
        },
    );
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
    const modeStyle = document.getElementById("voim-mode-style");
    if (modeStyle) {
        modeStyle.remove();
    }

    const fontStyle = document.getElementById("webeye-global-font-style");
    if (fontStyle) {
        fontStyle.remove();
    }
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
                        document.getElementById("voim-mode-style");
                    if (modeStyle) {
                        modeStyle.remove();
                    }

                    const globalFontStyle = document.getElementById(
                        "webeye-global-font-style",
                    );
                    if (globalFontStyle) {
                        globalFontStyle.remove();
                    }

                    const fontStyles = document.querySelectorAll(
                        '[style*="font-size"], [style*="font-weight"]',
                    );
                    fontStyles.forEach((el) => {
                        const htmlEl = el as HTMLElement;
                        htmlEl.style.removeProperty("font-size");
                        htmlEl.style.removeProperty("font-weight");
                    });

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
        chrome.storage.local.get(
            [
                STORAGE_KEYS.FONT_SIZE,
                STORAGE_KEYS.FONT_WEIGHT,
                STORAGE_KEYS.THEME_MODE,
            ],
            (result) => {
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
}): void {
    const updates: Record<string, any> = {};
    if (settings.fontSize) updates[STORAGE_KEYS.FONT_SIZE] = settings.fontSize;
    if (settings.fontWeight)
        updates[STORAGE_KEYS.FONT_WEIGHT] = settings.fontWeight;
    if (settings.mode) updates[STORAGE_KEYS.THEME_MODE] = settings.mode;

    // 스타일이 변경되면 STYLES_ENABLED를 true로 설정
    updates[STORAGE_KEYS.STYLES_ENABLED] = true;

    chrome.storage.local.set(updates);
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

            if (!stylesEnabled) {
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
 * 모든 스타일시트만 제거합니다. iframe은 유지됩니다.
 */
export function removeAllStyleSheets(): void {
    chrome.storage.local.set({ [STORAGE_KEYS.STYLES_ENABLED]: false }, () => {
        // 모든 요소의 스타일 속성 제거
        const elements = document.querySelectorAll("*");
        elements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.style) {
                htmlEl.style.removeProperty("fontSize");
                htmlEl.style.removeProperty("fontWeight");
                htmlEl.style.removeProperty("filter");
                htmlEl.style.removeProperty("backgroundColor");
                htmlEl.style.removeProperty("color");
                htmlEl.style.removeProperty("border-color");
            }
        });

        // 테마 모드 스타일시트 제거
        const modeStyle = document.getElementById("voim-mode-style");
        if (modeStyle) {
            modeStyle.remove();
        }

        // 폰트 스타일시트 제거
        const globalFontStyle = document.getElementById(
            "webeye-global-font-style",
        );
        if (globalFontStyle) {
            globalFontStyle.remove();
        }

        // 추가 스타일 속성 제거
        const fontStyles = document.querySelectorAll(
            '[style*="font-size"], [style*="font-weight"], [style*="background-color"], [style*="color"]',
        );
        fontStyles.forEach((el) => {
            const htmlEl = el as HTMLElement;
            htmlEl.style.removeProperty("font-size");
            htmlEl.style.removeProperty("font-weight");
            htmlEl.style.removeProperty("background-color");
            htmlEl.style.removeProperty("color");
            htmlEl.style.removeProperty("border-color");
        });

        // html과 body 요소의 스타일 직접 초기화
        document.documentElement.style.backgroundColor = "";
        document.documentElement.style.color = "";
        document.body.style.backgroundColor = "";
        document.body.style.color = "";

        checkExtensionState();
    });
}
