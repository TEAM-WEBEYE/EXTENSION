export interface ModeStyle {
    backgroundColor: string;
    color: string;
}

export interface FontStyle {
    fontSize?: string;
    fontWeight?: string;
}

export type FontSizeType =
    | "SET_FONT_SIZE_XS"
    | "SET_FONT_SIZE_S"
    | "SET_FONT_SIZE_M"
    | "SET_FONT_SIZE_L"
    | "SET_FONT_SIZE_XL";

export type FontWeightType =
    | "SET_FONT_WEIGHT_REGULAR"
    | "SET_FONT_WEIGHT_BOLD"
    | "SET_FONT_WEIGHT_XBOLD";

export type ModeType = "SET_MODE_LIGHT" | "SET_MODE_DARK";

export type MessageType =
    | FontSizeType
    | FontWeightType
    | ModeType
    | "DISABLE_ALL_STYLES"
    | "RESTORE_ALL_STYLES"
    | "REMOVE_ALL_STYLE_SHEETS";
