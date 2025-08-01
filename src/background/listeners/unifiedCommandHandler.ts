import { logger } from "@src/utils/logger";
import { iframeService } from "../services/iframeService";
import { settingsService } from "../services/settingsService";

type CommandAction =
    | "toggle_iframe"
    | "toggle_modal"
    | "toggle_sidebar"
    | "toggle_all_features"
    | "toolbar_icon_click";

export async function handleCommand(command: CommandAction): Promise<void> {
    logger.debug(`${command} 처리 시작`);

    try {
        switch (command) {
            case "toggle_iframe":
            case "toolbar_icon_click":
                await iframeService.toggleIframeInActiveTab();
                break;
            case "toggle_modal":
                await iframeService.toggleModalInActiveTab();
                break;
            case "toggle_sidebar":
                await iframeService.toggleSidebarInActiveTab();
                break;
            case "toggle_all_features":
                await handleStyleToggle();
                break;
            default:
                logger.warn(`알 수 없는 명령어: ${command}`);
        }

        logger.debug(`${command} 처리 완료`);
    } catch (error) {
        logger.error(`${command} 처리 중 오류:`, error);
        throw error;
    }
}

async function handleStyleToggle(): Promise<void> {
    const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
    });

    if (!tabs[0]?.id) {
        logger.error("활성화된 탭을 찾을 수 없습니다");
        return;
    }

    const result = await chrome.storage.local.get(["stylesEnabled"]);
    const isStylesEnabled = result.stylesEnabled ?? true;

    const iframeState = await iframeService.getIframeState();
    await iframeService.toggleStyleInActiveTab(iframeState.hiddenByAltV);

    if (isStylesEnabled) {
        await chrome.tabs.sendMessage(tabs[0].id, {
            type: "DISABLE_ALL_STYLES",
        });
        await chrome.storage.local.set({ stylesEnabled: false });
        settingsService.setStylesEnabled(false);
    } else {
        await chrome.tabs.sendMessage(tabs[0].id, {
            type: "RESTORE_ALL_STYLES",
        });
        await chrome.storage.local.set({ stylesEnabled: true });
        settingsService.setStylesEnabled(true);
    }
}
