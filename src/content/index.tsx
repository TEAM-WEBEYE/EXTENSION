const EXTENSION_IFRAME_ID = "floating-button-extension-iframe";

interface ModeStyle {
    backgroundColor: string;
    color: string;
}

interface FontStyle {
    fontSize?: string;
    fontWeight?: string;
}

interface UserSettings {
    fontSize?: string;
    fontWeight?: string;
    mode?: ModeType;
}

type FontSizeType =
    | "SET_FONT_SIZE_XS"
    | "SET_FONT_SIZE_S"
    | "SET_FONT_SIZE_M"
    | "SET_FONT_SIZE_L"
    | "SET_FONT_SIZE_XL";
type FontWeightType =
    | "SET_FONT_WEIGHT_REGULAR"
    | "SET_FONT_WEIGHT_BOLD"
    | "SET_FONT_WEIGHT_XBOLD";
type ModeType = "SET_MODE_LIGHT" | "SET_MODE_DARK";
type MessageType = FontSizeType | FontWeightType | ModeType;

const fontSizeMap: Record<FontSizeType, string> = {
    SET_FONT_SIZE_XS: "0.875rem",
    SET_FONT_SIZE_S: "1rem",
    SET_FONT_SIZE_M: "1.125rem",
    SET_FONT_SIZE_L: "1.25rem",
    SET_FONT_SIZE_XL: "1.5rem",
};

const fontWeightMap: Record<FontWeightType, string> = {
    SET_FONT_WEIGHT_REGULAR: "400",
    SET_FONT_WEIGHT_BOLD: "700",
    SET_FONT_WEIGHT_XBOLD: "800",
};

const modeStyleMap: Record<ModeType, ModeStyle> = {
    SET_MODE_LIGHT: {
        backgroundColor: "#fefefe",
        color: "#121212",
    },
    SET_MODE_DARK: {
        backgroundColor: "#121212",
        color: "#fefefe",
    },
};

const targetSelectors = [
    "h1",
    "h2",
    "p",
    "li",
    "h5",
    "ul",
    ".name",
    "em",
    "span",
    ".prod-buy-header__title",
    ".prod-description",
    ".prod-spec",
    ".delivery-info",
    "div",
];

function createIframe(): void {
    if (!document.getElementById(EXTENSION_IFRAME_ID)) {
        const iframe = document.createElement("iframe");
        iframe.id = EXTENSION_IFRAME_ID;
        iframe.src = chrome.runtime.getURL("iframe.html");

        iframe.onerror = function (error: Event | string) {
            console.error("Failed to load iframe:", error);
        };

        iframe.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            width: 65px;
            height: 65px;
            border: none;
            background: transparent;
            z-index: 2147483647;
        `;

        window.addEventListener("message", (event: MessageEvent) => {
            if (event.source !== iframe.contentWindow) {
                return;
            }

            if (event.data.type === "RESIZE_IFRAME") {
                if (event.data.isOpen) {
                    iframe.style.width = "100%";
                    iframe.style.height = "100%";
                    iframe.style.top = "0";
                    iframe.style.right = "0";
                } else {
                    iframe.style.width = "65px";
                    iframe.style.height = "65px";
                    iframe.style.top = "70px";
                    iframe.style.right = "20px";
                }
            }
        });

        document.body.appendChild(iframe);
    }
}

function applyFontStyle(style: FontStyle): void {
    const elements = document.querySelectorAll(targetSelectors.join(","));
    elements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (style.fontSize) {
            htmlEl.style.fontSize = style.fontSize;
            htmlEl.style.lineHeight = "1.0";
        }
        if (style.fontWeight) {
            htmlEl.style.fontWeight = style.fontWeight;
        }
    });
}

function applyModeStyle(modeType: ModeType): void {
    const mode = modeStyleMap[modeType];
    if (!mode) return;

    const { backgroundColor, color } = mode;

    const oldStyle = document.getElementById("webeye-mode-style");
    if (oldStyle) oldStyle.remove();

    const style = document.createElement("style");
    style.id = "webeye-mode-style";
    style.textContent = `
        * {
            color: ${color} !important;
            background-color: ${backgroundColor} !important;
        }

        html, body {
            background-color: ${backgroundColor} !important;
            color: ${color} !important;
        }

        a, span, div, p, h1, h2, h3, h4, h5, h6, li, ul, em, strong, td, th, button {
            color: ${color} !important;
            background-color: ${backgroundColor} !important;
            border-color: ${color} !important;
        }

        input, textarea, select {
            background-color: ${backgroundColor} !important;
            color: ${color} !important;
            border: 1px solid ${color} !important;
        }

        img, video {
            filter: brightness(0.8) contrast(1.2);
        }
         
        p, h1, h2, h3, h4, h5, h6, span, div, li {
            overflow-wrap: break-word !important;
            word-wrap: break-word !important;
            hyphens: auto !important;
            text-align: left !important; /* 왼쪽 정렬로 일관성 유지 */
            max-width: 100% !important; /* 최대 너비 제한 */
            text-overflow: ellipsis !important; /* 텍스트가 넘칠 경우 ... 표시 */
        }
        
        /* 줄 간격 추가 스타일 - 모든 텍스트 요소에 적용 */
        body, p, div, span, li, h1, h2, h3, h4, h5, h6 {
            line-height: calc(1.5em + 0.2vw) !important;
            margin-bottom: 0.5em !important; /* 단락 사이 간격 */
        }
        
        /* 단락 간격 추가 */
        p, li, div.paragraph {
            margin-bottom: 1em !important;
            padding-bottom: 0.5em !important;
        }
    `;
    document.head.appendChild(style);
}

function saveSettings(settings: Partial<UserSettings>): void {
    chrome.storage.sync.get(["userSettings"], (result) => {
        const currentSettings: UserSettings = result.userSettings || {};
        const updatedSettings = { ...currentSettings, ...settings };

        chrome.storage.sync.set({ userSettings: updatedSettings }, () => {
            console.log("Settings saved:", updatedSettings);
        });
    });
}

function loadAndApplySettings(): void {
    chrome.storage.sync.get(["userSettings"], (result) => {
        const settings: UserSettings = result.userSettings || {};
        console.log("Loaded settings:", settings);

        if (settings.fontSize) {
            applyFontStyle({ fontSize: settings.fontSize });
        }

        if (settings.fontWeight) {
            applyFontStyle({ fontWeight: settings.fontWeight });
        }

        if (settings.mode) {
            applyModeStyle(settings.mode);
        }
    });
}

chrome.runtime.onMessage.addListener(
    (message: { type: MessageType }, sender, sendResponse) => {
        const { type } = message;

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
        } else if (Object.keys(modeStyleMap).includes(type as string)) {
            const modeType = type as ModeType;
            applyModeStyle(modeType);
            saveSettings({ mode: modeType });
            sendResponse({ success: true });
        } else {
            sendResponse({ success: false, error: "알 수 없는 메시지" });
        }

        return true;
    },
);

createIframe();
loadAndApplySettings();

document.addEventListener("DOMContentLoaded", () => {
    loadAndApplySettings();
});

const observer = new MutationObserver((mutations) => {
    chrome.storage.sync.get(["userSettings"], (result) => {
        const settings: UserSettings = result.userSettings || {};

        if (settings.fontSize || settings.fontWeight) {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length > 0) {
                    const fontStyle: FontStyle = {};
                    if (settings.fontSize)
                        fontStyle.fontSize = settings.fontSize;
                    if (settings.fontWeight)
                        fontStyle.fontWeight = settings.fontWeight;

                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const element = node as HTMLElement;
                            if (settings.fontSize)
                                element.style.fontSize = settings.fontSize;
                            if (settings.fontWeight)
                                element.style.fontWeight = settings.fontWeight;

                            const childElements = element.querySelectorAll(
                                targetSelectors.join(","),
                            );
                            childElements.forEach((childEl) => {
                                const htmlChildEl = childEl as HTMLElement;
                                if (settings.fontSize)
                                    htmlChildEl.style.fontSize =
                                        settings.fontSize;
                                if (settings.fontWeight)
                                    htmlChildEl.style.fontWeight =
                                        settings.fontWeight;
                            });
                        }
                    });
                }
            });
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
});
