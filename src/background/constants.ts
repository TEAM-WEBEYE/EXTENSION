import { FontMessageType } from "./types";

export const DEFAULT_THEME = "light";
export const DEFAULT_FONT_SIZE = "m";
export const DEFAULT_FONT_WEIGHT = "bold";

export const DEFAULT_CURSOR_THEME = "white";
export const DEFAULT_CURSOR_SIZE = "medium";
export const DEFAULT_CURSOR_ENABLED = true;

export const EXTENSION_IFRAME_ID = "floating-button-extension-iframe";

export const ALLOWED_FONT_MESSAGES: FontMessageType[] = [
    "SET_FONT_SIZE_XS",
    "SET_FONT_SIZE_S",
    "SET_FONT_SIZE_M",
    "SET_FONT_SIZE_L",
    "SET_FONT_SIZE_XL",
    "SET_FONT_WEIGHT_REGULAR",
    "SET_FONT_WEIGHT_BOLD",
    "SET_FONT_WEIGHT_XBOLD",
    "SET_MODE_LIGHT",
    "SET_MODE_DARK",
];

export const STORAGE_KEYS = {
    FONT_SIZE: "fontSize",
    FONT_WEIGHT: "fontWeight",
    THEME_MODE: "themeMode",
    IS_CURSOR_ENABLED: "isCursorEnabled",
    CURSOR_SIZE: "cursorSize",
    CURSOR_THEME: "cursorTheme",
    IFRAME_VISIBLE: "iframeVisible",
} as const;
