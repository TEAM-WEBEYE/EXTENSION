// Content script 서비스 인터페이스들

export interface SettingsService {
    applySettings?: (settings: any) => Promise<void>;
    resetSettings?: () => Promise<void>;
}

export interface StyleService {
    disableAllStyles?: () => Promise<void>;
    restoreAllStyles?: (settings: any) => Promise<void>;
    setMode?: (mode: string) => Promise<void>;
    setFontSize?: (size: string) => Promise<void>;
    setFontWeight?: (weight: string) => Promise<void>;
}



export interface ContentService {
    sync?: () => void;
    cleanup?: () => Promise<void>;
}
