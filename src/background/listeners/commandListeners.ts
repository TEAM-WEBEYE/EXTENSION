import { logger } from "@src/utils/logger";
import { handleCommand } from "./unifiedCommandHandler";

/**
 * 명령어 리스너 초기화
 */
export function initCommandListeners(): void {
    logger.debug("단축키 명령어 리스너 초기화 시작");

    chrome.commands.onCommand.addListener(async (command) => {
        try {
            logger.debug(`단축키 명령어 수신: ${command}`);
            await handleCommand(command as any);
        } catch (error) {
            logger.error(`명령어 처리 중 오류 발생: ${error}`);
        }
    });

    logger.debug("단축키 명령어 리스너 초기화 완료");
}
