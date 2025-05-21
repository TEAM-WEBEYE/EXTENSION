import { CursorSize, CursorTheme } from "../types";
import {
    DEFAULT_CURSOR_ENABLED,
    DEFAULT_CURSOR_SIZE,
    DEFAULT_CURSOR_THEME,
} from "../constants";
import { logger } from "@src/utils/logger";

/**
 * 커서 관련 서비스
 */
class CursorService {
    private cursorTheme: CursorTheme = DEFAULT_CURSOR_THEME;
    private cursorSize: CursorSize = DEFAULT_CURSOR_SIZE;
    private isCursorEnabled: boolean = DEFAULT_CURSOR_ENABLED;

    /**
     * 현재 커서 테마를 설정합니다.
     */
    async setCursorTheme(theme: CursorTheme): Promise<void> {
        this.cursorTheme = theme;
        await chrome.storage.sync.set({
            cursorTheme: theme,
            stylesEnabled: true,
        });
    }

    /**
     * 현재 커서 크기를 설정합니다.
     */
    async setCursorSize(size: CursorSize): Promise<void> {
        this.cursorSize = size;
        await chrome.storage.sync.set({
            cursorSize: size,
            stylesEnabled: true,
        });
    }

    /**
     * 커서 활성화 상태를 설정합니다.
     */
    async setCursorEnabled(enabled: boolean): Promise<void> {
        this.isCursorEnabled = enabled;
        await chrome.storage.sync.set({
            isCursorEnabled: enabled,
            stylesEnabled: true,
        });
    }

    /**
     * 현재 커서 테마를 반환합니다.
     */
    getCursorTheme(): CursorTheme {
        return this.cursorTheme;
    }

    /**
     * 현재 커서 크기를 반환합니다.
     */
    getCursorSize(): CursorSize {
        return this.cursorSize;
    }

    /**
     * 현재 커서 활성화 상태를 반환합니다.
     */
    isCursorActive(): boolean {
        return this.isCursorEnabled;
    }

    /**
     * 현재 커서 URL을 반환합니다.
     */
    getCurrentCursorUrl(): string {
        const cursorPath = `images/cursors/${this.cursorTheme}_${this.cursorSize}.png`;
        return chrome.runtime.getURL(cursorPath);
    }

    /**
     * 특정 탭에 커서 업데이트 메시지를 전송합니다.
     */
    async updateCursorForTab(tabId: number): Promise<void> {
        try {
            if (!tabId) return;

            const cursorUrl = this.isCursorEnabled
                ? this.getCurrentCursorUrl()
                : null;

            await chrome.tabs.sendMessage(tabId, {
                type: "UPDATE_CURSOR",
                isCursorEnabled: this.isCursorEnabled,
                cursorUrl: cursorUrl,
            });
        } catch (error) {
            logger.warn(`탭 ${tabId}에 커서 업데이트 실패:`, error);
        }
    }

    /**
     * 모든 탭의 커서를 업데이트합니다.
     */
    async updateAllTabs(): Promise<void> {
        try {
            const tabs = await chrome.tabs.query({});

            for (const tab of tabs) {
                if (tab.id && tab.url && tab.url.startsWith("http")) {
                    await this.updateCursorForTab(tab.id);
                }
            }
        } catch (error) {
            logger.error("모든 탭 커서 업데이트 실패:", error);
        }
    }

    /**
     * 커서 상태를 토글하고 모든 탭에 적용합니다.
     */
    async toggleCursor(): Promise<void> {
        this.isCursorEnabled = !this.isCursorEnabled;

        try {
            await chrome.storage.sync.set({
                isCursorEnabled: this.isCursorEnabled,
                stylesEnabled: true,
            });

            await this.updateAllTabs();

            logger.debug(
                `커서 상태 변경: ${this.isCursorEnabled ? "활성화" : "비활성화"}`,
            );
        } catch (error) {
            logger.error("커서 토글 중 오류:", error);
        }
    }
}

export const cursorService = new CursorService();
