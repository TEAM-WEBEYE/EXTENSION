import { logger } from "@src/utils/logger";
import { STORAGE_KEYS } from "../constants";

/**
 * 테마 및 글꼴 설정을 관리하는 서비스
 */
class ThemeService {
    private fontSize: string | null = null;
    private fontWeight: string | null = null;
    private themeMode: string | null = null;

    setFontSize(size: string): void {
        this.fontSize = size;
        logger.debug("글꼴 크기 설정:", size);
    }

    setFontWeight(weight: string): void {
        this.fontWeight = weight;
        logger.debug("글꼴 굵기 설정:", weight);
    }

    setTheme(mode: string): void {
        this.themeMode = mode;
        logger.debug("테마 모드 설정:", mode);
    }

    /**
     * 모든 탭에 테마 관련 설정을 전파합니다.
     */
    async updateAllTabs(): Promise<void> {
        try {
            const tabs = await chrome.tabs.query({});

            for (const tab of tabs) {
                if (tab.id != null) {
                    chrome.tabs.sendMessage(tab.id, {
                        type: "THEME_UPDATE",
                        payload: {
                            fontSize: this.fontSize,
                            fontWeight: this.fontWeight,
                            themeMode: this.themeMode,
                        },
                    });
                }
            }

            logger.debug("모든 탭에 테마 설정 전파 완료");
        } catch (error) {
            logger.error("테마 설정 전파 중 오류:", error);
        }
    }
}

export const themeService = new ThemeService();
