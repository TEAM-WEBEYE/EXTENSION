import { storageService } from "./storageService";
import {
    DEFAULT_FONT_SIZE,
    DEFAULT_FONT_WEIGHT,
    DEFAULT_THEME,
} from "../constants";
import { logger } from "@src/utils/logger";

/**
 * 설정 관련 서비스
 */
class SettingsService {
    private areStylesEnabled: boolean = true;

    /**
     * 스타일 활성화 상태를 반환합니다.
     */
    areStylesActive(): boolean {
        return this.areStylesEnabled;
    }

    /**
     * 스타일 활성화 상태를 설정합니다.
     */
    setStylesEnabled(enabled: boolean): void {
        this.areStylesEnabled = enabled;
    }

    /**
     * 모든 설정을 초기화합니다.
     */
    async resetAllSettings(): Promise<void> {
        try {
            await storageService.resetAllSettings();

            const tabs = await chrome.tabs.query({ active: true });

            for (const tab of tabs) {
                if (tab.id) {
                    try {
                        await chrome.tabs.sendMessage(tab.id, {
                            type: "APPLY_SETTINGS",
                            settings: {
                                themeMode: DEFAULT_THEME,
                                fontSize: DEFAULT_FONT_SIZE,
                                fontWeight: DEFAULT_FONT_WEIGHT,
                            },
                        });
                    } catch (e) {
                        logger.warn(
                            `탭 ${tab.id}에 설정 초기화 메시지 전송 실패`,
                            e,
                        );
                    }
                }
            }

            await this.sendSettingsToAllTabs();

            logger.debug("모든 설정이 초기화되었습니다.");
        } catch (error) {
            logger.error("설정 초기화 중 오류:", error);
            throw error;
        }
    }

    /**
     * 현재 활성화된 탭의 모든 스타일을 토글합니다.
     */
    async toggleAllStyles(tabId: number): Promise<void> {
        try {
            if (this.areStylesEnabled) {
                await chrome.tabs.sendMessage(tabId, {
                    type: "DISABLE_ALL_STYLES",
                });

                this.areStylesEnabled = false;

                logger.debug("모든 스타일이 비활성화되었습니다.");
            } else {
                const savedSettings = storageService.getSavedSettings();

                if (savedSettings) {
                    if (savedSettings.themeMode) {
                        await chrome.tabs.sendMessage(tabId, {
                            type: `SET_MODE_${savedSettings.themeMode.toUpperCase()}`,
                        });
                    }

                    await chrome.tabs.sendMessage(tabId, {
                        type: "RESTORE_ALL_STYLES",
                        settings: savedSettings,
                    });

                    logger.debug("모든 스타일이 복원되었습니다.");
                }

                this.areStylesEnabled = true;
            }
        } catch (error) {
            logger.error("스타일 토글 중 오류:", error);
        }
    }

    /**
     * 모든 탭에 설정 메시지를 전송합니다.
     */
    private async sendSettingsToAllTabs(): Promise<void> {
        try {
            const tabs = await chrome.tabs.query({});

            for (const tab of tabs) {
                if (!tab.id) continue;

                try {
                    await chrome.tabs
                        .sendMessage(tab.id, {
                            type: "RESET_SETTINGS",
                        })
                        .catch(() => {});

                    await chrome.tabs
                        .sendMessage(tab.id, {
                            type: "SET_MODE_LIGHT",
                        })
                        .catch(() => {});

                    await chrome.tabs
                        .sendMessage(tab.id, {
                            type: "SET_FONT_SIZE_M",
                        })
                        .catch(() => {});

                    await chrome.tabs
                        .sendMessage(tab.id, {
                            type: "SET_FONT_WEIGHT_BOLD",
                        })
                        .catch(() => {});
                } catch (error) {}
            }
        } catch (error) {
            logger.error("설정 메시지 전송 중 오류:", error);
        }
    }
}

export const settingsService = new SettingsService();
