import { FontMessageType } from "./types";

export const DEFAULT_THEME = "light";
export const DEFAULT_FONT_SIZE = "m";
export const DEFAULT_FONT_WEIGHT = "bold";

export const IFRAME_CONSTANTS = {
    ID: "floating-button-extension-iframe",
    STYLES: {
        DEFAULT: {
            position: "fixed",
            top: "70px",
            right: "20px",
            width: "65px",
            height: "130px",
            border: "none",
            background: "transparent",
            zIndex: "2147483647",
        },
        EXPANDED: {
            width: "100%",
            height: "100%",
            top: "0",
            right: "0",
        },
    },
} as const;

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
    THEME_MODE: "themeMode",
    FONT_SIZE: "fontSize",
    FONT_WEIGHT: "fontWeight",
    STYLES_ENABLED: "stylesEnabled",
} as const;
