import React, { createContext, useContext, useEffect } from "react";
import { useSyncedState } from "@src/hooks/useSyncedState";
import { getFontClasses } from "@src/utils/fontUtils";
import { applyCursorStyle } from "@src/utils/cursorUtils";
import {
    STORAGE_KEYS,
    DEFAULT_THEME,
    DEFAULT_FONT_SIZE,
    DEFAULT_FONT_WEIGHT,
    DEFAULT_CURSOR_THEME,
    DEFAULT_CURSOR_SIZE,
    DEFAULT_CURSOR_ENABLED,
} from "@src/background/constants";
import { removeAllStyleSheets } from "@src/content/storage/settingsManager";

export type Theme = "light" | "dark";
export type FontSize = "xs" | "s" | "m" | "l" | "xl";
export type FontWeight = "regular" | "bold" | "xbold";
export type CursorTheme =
    | "white"
    | "purple"
    | "yellow"
    | "mint"
    | "pink"
    | "black";
export type CursorSize = "small" | "medium" | "large";

interface DefaultSettings {
    theme: Theme;
    fontSize: FontSize;
    fontWeight: FontWeight;
    cursorTheme: CursorTheme;
    cursorSize: CursorSize;
    isCursorEnabled: boolean;
}

const DEFAULT_SETTINGS: DefaultSettings = {
    theme: DEFAULT_THEME,
    fontSize: DEFAULT_FONT_SIZE,
    fontWeight: DEFAULT_FONT_WEIGHT,
    cursorTheme: DEFAULT_CURSOR_THEME,
    cursorSize: DEFAULT_CURSOR_SIZE,
    isCursorEnabled: DEFAULT_CURSOR_ENABLED,
};

interface ThemeContextValue {
    theme: Theme;
    fontSize: FontSize;
    fontWeight: FontWeight;
    cursorTheme: CursorTheme;
    cursorSize: CursorSize;
    isCursorEnabled: boolean;
    fontClasses: {
        fontHeading: string;
        fontCommon: string;
        fontCaption: string;
    };
    setTheme: (v: Theme) => void;
    setFontSize: (v: FontSize) => void;
    setFontWeight: (v: FontWeight) => void;
    setCursorTheme: (v: CursorTheme) => void;
    setCursorSize: (v: CursorSize) => void;
    toggleCursor: () => void;
    resetSettings: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeContextProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [theme, setTheme] = useSyncedState<Theme>(
        STORAGE_KEYS.THEME_MODE,
        DEFAULT_SETTINGS.theme,
    );
    const [fontSize, setFontSize] = useSyncedState<FontSize>(
        STORAGE_KEYS.FONT_SIZE,
        DEFAULT_SETTINGS.fontSize,
    );
    const [fontWeight, setFontWeight] = useSyncedState<FontWeight>(
        STORAGE_KEYS.FONT_WEIGHT,
        DEFAULT_SETTINGS.fontWeight,
    );
    const [cursorTheme, setCursorTheme] = useSyncedState<CursorTheme>(
        STORAGE_KEYS.CURSOR_THEME,
        DEFAULT_SETTINGS.cursorTheme,
    );
    const [cursorSize, setCursorSize] = useSyncedState<CursorSize>(
        STORAGE_KEYS.CURSOR_SIZE,
        DEFAULT_SETTINGS.cursorSize,
    );
    const [isCursorEnabled, setIsCursorEnabled] = useSyncedState<boolean>(
        STORAGE_KEYS.IS_CURSOR_ENABLED,
        DEFAULT_SETTINGS.isCursorEnabled,
    );

    useEffect(() => {
        applyCursorStyle(cursorTheme, cursorSize, isCursorEnabled);
    }, [cursorTheme, cursorSize, isCursorEnabled]);

    const toggleCursor = () => setIsCursorEnabled(!isCursorEnabled);

    const resetSettings = () => {
        setTheme(DEFAULT_SETTINGS.theme);
        setFontSize(DEFAULT_SETTINGS.fontSize);
        setFontWeight(DEFAULT_SETTINGS.fontWeight);
        setCursorTheme(DEFAULT_SETTINGS.cursorTheme);
        setCursorSize(DEFAULT_SETTINGS.cursorSize);
        setIsCursorEnabled(DEFAULT_SETTINGS.isCursorEnabled);

        // 스타일만 제거하고 iframe은 유지
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: "REMOVE_ALL_STYLE_SHEETS",
                });
            }
        });
    };

    const fontClasses = getFontClasses(fontSize, fontWeight);

    return (
        <ThemeContext.Provider
            value={{
                theme,
                fontSize,
                fontWeight,
                cursorTheme,
                cursorSize,
                isCursorEnabled,
                fontClasses,
                setTheme,
                setFontSize,
                setFontWeight,
                setCursorTheme,
                setCursorSize,
                toggleCursor,
                resetSettings,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeContextProvider");
    }
    return context;
}
