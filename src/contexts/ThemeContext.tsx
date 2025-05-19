import React, { createContext, useContext, useEffect } from "react";
import { useSyncedState } from "@src/hooks/useSyncedState";
import { getFontClasses } from "@src/utils/fontUtils";
import { applyCursorStyle } from "@src/utils/cursorUtils";

export type Theme = "light" | "dark";
export type FontSize = "xl" | "l" | "m" | "s" | "xs";
export type FontWeight = "xbold" | "bold" | "regular";
export type CursorTheme =
    | "white"
    | "purple"
    | "yellow"
    | "mint"
    | "pink"
    | "black";
export type CursorSize = "small" | "medium" | "large";

const DEFAULT_SETTINGS = {
    theme: "light" as Theme,
    fontSize: "m" as FontSize,
    fontWeight: "bold" as FontWeight,
    cursorTheme: "white" as CursorTheme,
    cursorSize: "medium" as CursorSize,
    isCursorEnabled: true,
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
        "themeMode",
        DEFAULT_SETTINGS.theme,
    );
    const [fontSize, setFontSize] = useSyncedState<FontSize>(
        "fontSize",
        DEFAULT_SETTINGS.fontSize,
    );
    const [fontWeight, setFontWeight] = useSyncedState<FontWeight>(
        "fontWeight",
        DEFAULT_SETTINGS.fontWeight,
    );
    const [cursorTheme, setCursorTheme] = useSyncedState<CursorTheme>(
        "cursorTheme",
        DEFAULT_SETTINGS.cursorTheme,
    );
    const [cursorSize, setCursorSize] = useSyncedState<CursorSize>(
        "cursorSize",
        DEFAULT_SETTINGS.cursorSize,
    );
    const [isCursorEnabled, setIsCursorEnabled] = useSyncedState<boolean>(
        "isCursorEnabled",
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
    };

    const fontClasses = getFontClasses(
        fontSize || DEFAULT_SETTINGS.fontSize,
        fontWeight || DEFAULT_SETTINGS.fontWeight,
    );

    return (
        <ThemeContext.Provider
            value={{
                theme,
                fontSize: fontSize || DEFAULT_SETTINGS.fontSize,
                fontWeight: fontWeight || DEFAULT_SETTINGS.fontWeight,
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
    if (!context)
        throw new Error("useTheme must be used within a ThemeContextProvider");
    return context;
}
