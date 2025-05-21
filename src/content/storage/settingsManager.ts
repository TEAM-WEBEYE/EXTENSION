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

let originalSettings: {
    fontSize?: string;
    fontWeight?: string;
    themeMode?: string;
} | null = null;
let contentCursorEnabled = true;

/**
 * 확장 프로그램의 상태를 확인하고 적절히 처리합니다.
 */
export function checkExtensionState(): void {
    chrome.storage.sync.get(["stylesEnabled"], (result) => {
        const stylesEnabled =
            result.stylesEnabled !== undefined ? result.stylesEnabled : true;

        if (stylesEnabled) {
            loadAndApplySettings();
            if (!iframeVisible()) {
                createIframe();
            }
        } else {
            ensureStylesRemoved();
            if (iframeVisible()) {
                removeIframe();
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
            originalSettings = {
                fontSize: result.fontSize,
                fontWeight: result.fontWeight,
                themeMode: result.themeMode,
            };

            chrome.storage.sync.set({ stylesEnabled: false }, () => {
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
                const modeStyle = document.getElementById("webeye-mode-style");
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

                removeStyleFromIframes();
                removeIframe();

                console.log("모든 스타일과 iframe이 제거되었습니다.");
            });
        },
    );
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
                const settings = {
                    fontSize: result.fontSize || originalSettings?.fontSize,
                    fontWeight:
                        result.fontWeight || originalSettings?.fontWeight,
                    themeMode: result.themeMode || originalSettings?.themeMode,
                };

                setTimeout(() => {
                    if (settings.themeMode) {
                        applyModeStyle(settings.themeMode);
                    }

                    const fontStyle: Partial<FontStyle> = {};
                    if (settings.fontSize)
                        fontStyle.fontSize = settings.fontSize;
                    if (settings.fontWeight)
                        fontStyle.fontWeight = settings.fontWeight;
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
 * 사용자 설정을 저장합니다.
 * @param settings 저장할 설정 객체
 */
export function saveSettings(settings: {
    fontSize?: string;
    fontWeight?: string;
    themeMode?: string;
}): void {
    chrome.storage.sync.set(settings, () => {
        console.log("Settings saved:", settings);
    });
}

/**
 * 설정을 로드하고 페이지에 적용합니다.
 */
export function loadAndApplySettings(): void {
    chrome.storage.sync.get(
        ["fontSize", "fontWeight", "themeMode", "stylesEnabled"],
        (result) => {
            const settings = {
                fontSize: result.fontSize,
                fontWeight: result.fontWeight,
                themeMode: result.themeMode,
            };
            const stylesEnabled =
                result.stylesEnabled !== undefined
                    ? result.stylesEnabled
                    : true;

            console.log(
                "Loaded settings:",
                settings,
                "Styles enabled:",
                stylesEnabled,
            );

            if (!stylesEnabled) {
                console.log(
                    "스타일이 비활성화 상태입니다. 설정을 적용하지 않습니다.",
                );
                return;
            }

            // 테마 모드 적용
            if (settings.themeMode) {
                applyModeStyle(settings.themeMode);
            }

            const fontStyle: FontStyle = {
                fontSize: settings.fontSize,
                fontWeight: settings.fontWeight,
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
