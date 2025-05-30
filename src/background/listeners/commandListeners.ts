import { logger } from "@src/utils/logger";
import { handleIframeToggle } from "./iframeCommandHandler";
import { handleModalToggle } from "./modalCommandHandler";
import { handleStyleToggle } from "./styleCommandHandler";
import { handleSidebarToggle } from "./sidebarCommandHandler";

/**
 * 명령어 리스너 초기화
 */
export function initCommandListeners(): void {
    logger.debug("단축키 명령어 리스너 초기화 시작");

    chrome.commands.onCommand.addListener(async (command) => {
        try {
            logger.debug(`단축키 명령어 수신: ${command}`);
            logger.debug(`명령어 타입: ${typeof command}`);
            logger.debug(
                `현재 활성화된 탭: ${await chrome.tabs.query({ active: true, currentWindow: true })}`,
            );

            const commands = await chrome.commands.getAll();
            logger.debug("사용 가능한 명령어:", commands);

            switch (command) {
                case "toggle_iframe":
                    logger.debug("toggle_iframe 명령어 처리 시작");
                    await handleIframeToggle();
                    logger.debug("toggle_iframe 명령어 처리 완료");
                    break;
                case "toggle_modal":
                    logger.debug("toggle_modal 명령어 처리 시작");
                    await handleModalToggle();
                    logger.debug("toggle_modal 명령어 처리 완료");
                    break;
                case "toggle_sidebar":
                    logger.debug("toggle_sidebar 명령어 처리 시작");
                    await handleSidebarToggle();
                    logger.debug("toggle_sidebar 명령어 처리 완료");
                    break;
                case "toggle_all_features":
                    logger.debug("toggle_all_features 명령어 처리 시작");
                    await handleStyleToggle();
                    logger.debug("toggle_all_features 명령어 처리 완료");
                    break;
                default:
                    logger.warn(`알 수 없는 명령어: ${command}`);
            }
        } catch (error) {
            logger.error(`명령어 처리 중 오류 발생: ${error}`);
        }
    });

    logger.debug("단축키 명령어 리스너 초기화 완료");
}
