export interface SavedSettings {
    fontSize?: string;
    fontWeight?: string;
    themeMode?: string;
}

export type FontMessageType =
    | "SET_FONT_SIZE_XS"
    | "SET_FONT_SIZE_S"
    | "SET_FONT_SIZE_M"
    | "SET_FONT_SIZE_L"
    | "SET_FONT_SIZE_XL"
    | "SET_FONT_WEIGHT_REGULAR"
    | "SET_FONT_WEIGHT_BOLD"
    | "SET_FONT_WEIGHT_XBOLD"
    | "SET_MODE_LIGHT"
    | "SET_MODE_DARK";

export type MessageType =
    | FontMessageType
    | "RESET_SETTINGS"
    | "DISABLE_ALL_STYLES"
    | "RESTORE_ALL_STYLES"
    | "TOGGLE_MODAL"
    | "TOGGLE_SIDEBAR"
    | "APPLY_SETTINGS";

export type CommandType = string;

export type KnownCommandType =
    | "toggle_iframe"
    | "toggle-modal"
    | "toggle-all-features";
