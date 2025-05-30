import React, { createContext, useContext } from "react";
import { useSyncedState } from "@src/hooks/useSyncedState";
import { getFontClasses } from "@src/utils/fontUtils";
import {
    STORAGE_KEYS,
    DEFAULT_THEME,
    DEFAULT_FONT_SIZE,
    DEFAULT_FONT_WEIGHT,
} from "@src/background/constants";

export type Theme = "light" | "dark";
export type FontSize = "xs" | "s" | "m" | "l" | "xl";
export type FontWeight = "regular" | "bold" | "xbold";

interface DefaultSettings {
    theme: Theme;
    fontSize: FontSize;
    fontWeight: FontWeight;
}

const DEFAULT_SETTINGS: DefaultSettings = {
    theme: DEFAULT_THEME,
    fontSize: DEFAULT_FONT_SIZE,
    fontWeight: DEFAULT_FONT_WEIGHT,
};

interface ThemeContextValue {
    theme: Theme;
    fontSize: FontSize;
    fontWeight: FontWeight;
    fontClasses: {
        fontHeading: string;
        fontCommon: string;
        fontCaption: string;
    };
    setTheme: (v: Theme) => void;
    setFontSize: (v: FontSize) => void;
    setFontWeight: (v: FontWeight) => void;
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

    const resetSettings = () => {
        setTheme(DEFAULT_SETTINGS.theme);
        setFontSize(DEFAULT_SETTINGS.fontSize);
        setFontWeight(DEFAULT_SETTINGS.fontWeight);

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
                fontClasses,
                setTheme,
                setFontSize,
                setFontWeight,
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
