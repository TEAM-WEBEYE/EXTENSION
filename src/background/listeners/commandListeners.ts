import { logger } from "@src/utils/logger";
import { handleIframeToggle } from "./iframeCommandHandler";
import { handleModalToggle } from "./modalCommandHandler";
import { handleStyleToggle } from "./styleCommandHandler";

/**
 * 명령어 리스너 초기화
 */
export function initCommandListeners(): void {
    chrome.commands.onCommand.addListener(async (command) => {
        logger.debug(`Command received: ${command}`);
        logger.debug(`Command type: ${typeof command}`);
        logger.debug(`Available commands:`, await chrome.commands.getAll());

        switch (command) {
            case "toggle_iframe":
                logger.debug("Handling toggle_iframe command");
                await handleIframeToggle();
                break;
            case "toggle_modal":
                logger.debug("Handling toggle-modal command");
                await handleModalToggle();
                break;
            case "toggle_all_features":
                logger.debug("Handling toggle-all-features command");
                await handleStyleToggle();
                break;
            default:
                logger.warn(`Unknown command: ${command}`);
        }
    });
}
