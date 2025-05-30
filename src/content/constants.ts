import { FontSizeType, FontWeightType, ModeStyle, ModeType } from "./types";

export const EXTENSION_IFRAME_ID = "floating-button-extension-iframe";

export const fontSizeMap: Record<FontSizeType, string> = {
    SET_FONT_SIZE_XS: "20px",
    SET_FONT_SIZE_S: "22px",
    SET_FONT_SIZE_M: "24px",
    SET_FONT_SIZE_L: "26px",
    SET_FONT_SIZE_XL: "28px",
};

export const fontWeightMap: Record<FontWeightType, string> = {
    SET_FONT_WEIGHT_REGULAR: "400",
    SET_FONT_WEIGHT_BOLD: "700",
    SET_FONT_WEIGHT_XBOLD: "800",
};

export const modeStyleMap: Record<ModeType, ModeStyle> = {
    SET_MODE_LIGHT: {
        backgroundColor: "#fefefe",
        color: "#121212",
    },
    SET_MODE_DARK: {
        backgroundColor: "#121212",
        color: "#fefefe",
    },
};

export const targetSelectors = [
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
