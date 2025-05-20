import { FontStyle, ModeType } from "../types";
import { applyFontStyle } from "../styles/fontStyles";
import { applyModeStyle } from "../styles/modeStyles";
import { applyCursorStyle, removeCursorStyle } from "../styles/cursorStyles";
import {
    createIframe,
    removeIframe,
    restoreIframe,
} from "../iframe/iframeManager";
import { removeStyleFromIframes } from "../styles/cursorStyles";

let originalFontSize: string | null = null;
let originalFontWeight: string | null = null;
let originalThemeMode: ModeType | null = null;
let contentCursorEnabled = true;

/**
 * 확장 프로그램의 상태를 확인하고 적절히 처리합니다.
 */
export function checkExtensionState(): void {
    chrome.storage.sync.get(["stylesEnabled", "iframeVisible"], (result) => {
        const stylesEnabled =
            result.stylesEnabled !== undefined ? result.stylesEnabled : true;
        const iframeVisible =
            result.iframeVisible !== undefined ? result.iframeVisible : true;

        if (stylesEnabled) {
            loadAndApplySettings();
            if (iframeVisible) {
                createIframe();
            }
        } else {
            ensureStylesRemoved();
            if (iframeVisible) {
                createIframe();
            }
        }
    });
}

/**
 * 현재 스타일 활성화 상태를 가져옵니다.
 */
export function getStylesEnabledState(
    callback: (enabled: boolean) => void,
): void {
    chrome.storage.sync.get(["stylesEnabled"], (result) => {
        const stylesEnabled =
            result.stylesEnabled !== undefined ? result.stylesEnabled : true;
        callback(stylesEnabled);
    });
}

/**
 * iframe의 가시성 상태를 확인합니다.
 */
function iframeVisible(): boolean {
    return document.getElementById("floating-button-extension-iframe") !== null;
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
    chrome.storage.sync.get(
        ["fontSize", "fontWeight", "themeMode"],
        (result) => {
            originalFontSize = result.fontSize || null;
            originalFontWeight = result.fontWeight || null;
            originalThemeMode = result.themeMode || null;

            chrome.storage.sync.set(
                { stylesEnabled: false, iframeVisible: false },
                () => {
                    console.log("스타일 비활성화 상태 저장됨");

                    // 모든 요소의 인라인 스타일 제거
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

                    // 모든 커스텀 스타일 제거
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

                    // 폰트 스타일 관련 추가 제거
                    const fontStyles = document.querySelectorAll(
                        '[style*="font-size"], [style*="font-weight"]',
                    );
                    fontStyles.forEach((el) => {
                        const htmlEl = el as HTMLElement;
                        htmlEl.style.removeProperty("font-size");
                        htmlEl.style.removeProperty("font-weight");
                    });

                    console.log("모든 스타일과 iframe이 제거되었습니다.");
                },
            );
        },
    );
    chrome.storage.sync.get(["stylesEnabled", "iframeVisible"], (result) => {
        if (!(result.stylesEnabled && result.iframeVisible)) {
            removeStyleFromIframes();
            removeIframe();
        }
    });
}

/**
 * 모든 스타일을 복원합니다.
 */
export function restoreAllStyles(): void {
    chrome.storage.sync.set({ stylesEnabled: true }, () => {
        console.log("스타일 활성화 상태 저장됨");

        chrome.storage.sync.get(
            ["fontSize", "fontWeight", "themeMode"],
            (result) => {
                const fontSize = result.fontSize || originalFontSize;
                const fontWeight = result.fontWeight || originalFontWeight;
                const themeMode = result.themeMode || originalThemeMode;

                setTimeout(() => {
                    if (themeMode) {
                        applyModeStyle(themeMode);
                    }

                    const fontStyle: Partial<FontStyle> = {};
                    if (fontSize) fontStyle.fontSize = fontSize;
                    if (fontWeight) fontStyle.fontWeight = fontWeight;
                    if (Object.keys(fontStyle).length) {
                        applyFontStyle(fontStyle);
                    }

                    restoreIframe();

                    console.log("모든 스타일과 iframe이 복원되었습니다.");
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
 * 폰트 크기 설정을 저장하고 적용합니다.
 */
export function saveFontSize(fontSize: string): void {
    chrome.storage.sync.set({ fontSize }, () => {
        console.log("폰트 크기 설정 저장됨:", fontSize);
        applyFontStyle({ fontSize });
    });
}

/**
 * 폰트 두께 설정을 저장하고 적용합니다.
 */
export function saveFontWeight(fontWeight: string): void {
    chrome.storage.sync.set({ fontWeight }, () => {
        console.log("폰트 두께 설정 저장됨:", fontWeight);
        applyFontStyle({ fontWeight });
    });
}

/**
 * 테마 모드 설정을 저장하고 적용합니다.
 */
export function saveThemeMode(themeMode: ModeType): void {
    chrome.storage.sync.set({ themeMode }, () => {
        console.log("테마 모드 설정 저장됨:", themeMode);
        applyModeStyle(themeMode);
    });
}

/**
 * 모든 설정을 초기화합니다.
 */
export function resetAllStyles(): void {
    chrome.storage.sync.get(
        ["fontSize", "fontWeight", "themeMode"],
        (result) => {
            originalFontSize = result.fontSize || null;
            originalFontWeight = result.fontWeight || null;
            originalThemeMode = result.themeMode || null;

            chrome.storage.sync.set(
                { stylesEnabled: false, iframeVisible: true },
                () => {
                    console.log("스타일 비활성화 상태 저장됨");

                    // 모든 요소의 인라인 스타일 제거
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

                    // 모든 커스텀 스타일 제거
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

                    // 폰트 스타일 관련 추가 제거
                    const fontStyles = document.querySelectorAll(
                        '[style*="font-size"], [style*="font-weight"]',
                    );
                    fontStyles.forEach((el) => {
                        const htmlEl = el as HTMLElement;
                        htmlEl.style.removeProperty("font-size");
                        htmlEl.style.removeProperty("font-weight");
                    });
                },
            );
        },
    );
}

/**
 * 설정을 로드하고 페이지에 적용합니다.
 */
export function loadAndApplySettings(): void {
    chrome.storage.sync.get(
        ["fontSize", "fontWeight", "themeMode", "stylesEnabled"],
        (result) => {
            const stylesEnabled =
                result.stylesEnabled !== undefined
                    ? result.stylesEnabled
                    : true;

            if (!stylesEnabled) {
                console.log(
                    "스타일이 비활성화 상태입니다. 설정을 적용하지 않습니다.",
                );
                return;
            }

            // 테마 모드 적용
            if (result.themeMode) {
                applyModeStyle(result.themeMode);
            }

            const fontStyle: FontStyle = {
                fontSize: result.fontSize,
                fontWeight: result.fontWeight,
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

    chrome.storage.sync.get(["stylesEnabled"], (result) => {
        const stylesEnabled =
            result.stylesEnabled !== undefined ? result.stylesEnabled : true;

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
