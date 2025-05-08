import { getExtensionUrl } from "@src/utils/getExtensionUrl";
import React, { createContext, useContext, useEffect, useState } from "react";

export type CursorTheme =
    | "white"
    | "purple"
    | "yellow"
    | "mint"
    | "pink"
    | "black";
export type CursorSize = "small" | "medium" | "large";

export const DEFAULT_CURSOR_THEME: CursorTheme = "white";
export const DEFAULT_CURSOR_SIZE: CursorSize = "medium";
export const DEFAULT_CURSOR_ENABLED: boolean = true;

interface CursorContextValue {
    cursorTheme: CursorTheme;
    cursorSize: CursorSize;
    isCursorEnabled: boolean;
    setCursorTheme: (theme: CursorTheme) => void;
    setCursorSize: (size: CursorSize) => void;
    toggleCursor: () => void;
    resetCursorSettings: () => void;
}

const CursorContext = createContext<CursorContextValue | undefined>(undefined);

const cursorImages: Record<CursorTheme, Record<CursorSize, string>> = {
    white: {
        small: "cursors/white_small.png",
        medium: "cursors/white_medium.png",
        large: "cursors/white_large.png",
    },
    purple: {
        small: "cursors/purple_small.png",
        medium: "cursors/purple_medium.png",
        large: "cursors/purple_large.png",
    },
    yellow: {
        small: "cursors/yellow_small.png",
        medium: "cursors/yellow_medium.png",
        large: "cursors/yellow_large.png",
    },
    mint: {
        small: "cursors/mint_small.png",
        medium: "cursors/mint_medium.png",
        large: "cursors/mint_large.png",
    },
    pink: {
        small: "cursors/pink_small.png",
        medium: "cursors/pink_medium.png",
        large: "cursors/pink_large.png",
    },
    black: {
        small: "cursors/black_small.png",
        medium: "cursors/black_medium.png",
        large: "cursors/black_large.png",
    },
};

const applyCursorStyle = (
    theme: CursorTheme,
    size: CursorSize,
    enabled: boolean,
) => {
    try {
        if (!enabled) {
            const existingStyle = document.getElementById(
                "custom-cursor-style",
            );
            if (existingStyle) {
                document.head.removeChild(existingStyle);
            }

            const iframes = document.querySelectorAll("iframe");
            iframes.forEach((iframe) => {
                try {
                    const iframeDoc =
                        iframe.contentDocument ||
                        iframe.contentWindow?.document;
                    if (iframeDoc) {
                        const existingIframeStyle = iframeDoc.getElementById(
                            "custom-cursor-style",
                        );
                        if (existingIframeStyle) {
                            iframeDoc.head.removeChild(existingIframeStyle);
                        }
                    }
                } catch (e) {
                    console.warn(
                        "iframe 커서 스타일 제거 실패 (cross-origin?):",
                        e,
                    );
                }
            });

            return;
        }

        const cursorUrl = getExtensionUrl(cursorImages[theme][size]);

        const styleContent = `
            body, button, a, input, select, textarea {
                cursor: url('${cursorUrl}'), auto !important;
            }
        `;

        const existingStyle = document.getElementById("custom-cursor-style");
        if (existingStyle) {
            document.head.removeChild(existingStyle);
        }
        const styleElement = document.createElement("style");
        styleElement.id = "custom-cursor-style";
        styleElement.textContent = styleContent;
        document.head.appendChild(styleElement);

        const iframes = document.querySelectorAll("iframe");
        iframes.forEach((iframe) => {
            try {
                const iframeDoc =
                    iframe.contentDocument || iframe.contentWindow?.document;
                if (iframeDoc) {
                    const existingIframeStyle = iframeDoc.getElementById(
                        "custom-cursor-style",
                    );
                    if (existingIframeStyle) {
                        iframeDoc.head.removeChild(existingIframeStyle);
                    }
                    const iframeStyle = iframeDoc.createElement("style");
                    iframeStyle.id = "custom-cursor-style";
                    iframeStyle.textContent = styleContent;
                    iframeDoc.head.appendChild(iframeStyle);
                }
            } catch (e) {
                console.warn(
                    "iframe 커서 스타일 적용 실패 (cross-origin?):",
                    e,
                );
            }
        });
    } catch (error) {
        console.error("커서 스타일 적용 중 오류:", error);
    }
};

export function CursorProvider({
    children,
    initialTheme = DEFAULT_CURSOR_THEME,
    initialSize = DEFAULT_CURSOR_SIZE,
    initialEnabled = DEFAULT_CURSOR_ENABLED,
}: {
    children: React.ReactNode;
    initialTheme?: CursorTheme;
    initialSize?: CursorSize;
    initialEnabled?: boolean;
}) {
    const [cursorTheme, setCursorThemeState] =
        useState<CursorTheme>(initialTheme);
    const [cursorSize, setCursorSizeState] = useState<CursorSize>(initialSize);
    const [isCursorEnabled, setIsCursorEnabled] =
        useState<boolean>(initialEnabled);

    useEffect(() => {
        if (typeof chrome !== "undefined" && chrome.storage?.sync) {
            chrome.storage.sync.get(
                ["cursorTheme", "cursorSize", "isCursorEnabled"],
                (result) => {
                    if (
                        result.cursorTheme &&
                        Object.keys(cursorImages).includes(result.cursorTheme)
                    ) {
                        setCursorThemeState(result.cursorTheme as CursorTheme);
                    }

                    if (
                        result.cursorSize &&
                        ["small", "medium", "large"].includes(result.cursorSize)
                    ) {
                        setCursorSizeState(result.cursorSize as CursorSize);
                    }

                    if (typeof result.isCursorEnabled === "boolean") {
                        setIsCursorEnabled(result.isCursorEnabled);
                    }
                },
            );
        }
    }, []);

    useEffect(() => {
        if (typeof document !== "undefined") {
            applyCursorStyle(cursorTheme, cursorSize, isCursorEnabled);
        }
    }, [cursorTheme, cursorSize, isCursorEnabled]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const handleMessage = (event: MessageEvent) => {
                if (event.data.type === "TOGGLE_CURSOR") {
                    toggleCursor();
                } else if (event.data.type === "RESET_SETTINGS") {
                    resetCursorSettings();
                }
            };

            window.addEventListener("message", handleMessage);

            return () => {
                window.removeEventListener("message", handleMessage);
            };
        }
    }, [isCursorEnabled]);

    const setCursorTheme = (newTheme: CursorTheme) => {
        setCursorThemeState(newTheme);
        if (typeof chrome !== "undefined" && chrome.storage?.sync?.set) {
            chrome.storage.sync.set({ cursorTheme: newTheme });
        }
    };

    const setCursorSize = (newSize: CursorSize) => {
        setCursorSizeState(newSize);
        if (typeof chrome !== "undefined" && chrome.storage?.sync?.set) {
            chrome.storage.sync.set({ cursorSize: newSize });
        }
    };

    const toggleCursor = () => {
        const newState = !isCursorEnabled;

        setIsCursorEnabled(newState);

        if (typeof chrome !== "undefined" && chrome.storage?.sync?.set) {
            chrome.storage.sync.set({ isCursorEnabled: newState }, () => {});
        }
    };

    const resetCursorSettings = () => {
        setCursorThemeState(DEFAULT_CURSOR_THEME);
        setCursorSizeState(DEFAULT_CURSOR_SIZE);
        setIsCursorEnabled(DEFAULT_CURSOR_ENABLED);

        if (typeof chrome !== "undefined" && chrome.storage?.sync?.set) {
            chrome.storage.sync.set(
                {
                    cursorTheme: DEFAULT_CURSOR_THEME,
                    cursorSize: DEFAULT_CURSOR_SIZE,
                    isCursorEnabled: DEFAULT_CURSOR_ENABLED,
                },
                () => {
                    console.log("커서 설정이 초기화되었습니다.");
                },
            );
        }
    };

    return (
        <CursorContext.Provider
            value={{
                cursorTheme,
                cursorSize,
                isCursorEnabled,
                setCursorTheme,
                setCursorSize,
                toggleCursor,
                resetCursorSettings,
            }}
        >
            {children}
        </CursorContext.Provider>
    );
}

export function useCursorTheme() {
    const context = useContext(CursorContext);
    if (!context) {
        throw new Error("useCursorTheme must be used within a CursorProvider");
    }
    return context;
}
