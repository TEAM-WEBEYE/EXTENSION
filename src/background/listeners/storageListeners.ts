import { logger } from "@src/utils/logger";
import { serviceManager } from "../services/ServiceManager";
import { STORAGE_KEYS } from "../constants";

/**
 * 스토리지 변경 리스너 초기화
 * 싱글턴 서비스를 통해 중앙 집중식으로 관리됩니다.
 */
export function initStorageListeners(): void {
    try {
        logger.debug("스토리지 리스너 초기화 시작");

        chrome.storage.onChanged.addListener(async (changes, namespace) => {
            if (namespace !== "local") return;

            try {
                // 서비스 매니저가 준비되었는지 확인
                if (!serviceManager.isReady()) {
                    logger.warn("서비스 매니저가 아직 준비되지 않았습니다.");
                    return;
                }

                // 스토리지 서비스 가져오기
                const storageService =
                    serviceManager.getService<any>("storage");

                // 설정 관련 변경사항 처리
                const settingKeys = [
                    STORAGE_KEYS.FONT_SIZE,
                    STORAGE_KEYS.FONT_WEIGHT,
                    STORAGE_KEYS.THEME_MODE,
                    STORAGE_KEYS.STYLES_ENABLED,
                ];

                const hasSettingChanges = settingKeys.some(
                    (key) => changes[key as keyof typeof changes],
                );

                if (hasSettingChanges) {
                    logger.debug("설정 변경 감지:", changes);

                    // 스토리지 서비스의 변경 처리 메서드 호출
                    if (storageService.handleStorageChanges) {
                        storageService.handleStorageChanges(changes);
                    }

                    // 모든 서비스 상태 동기화
                    await serviceManager.syncAllServices();
                }

                // 기타 변경사항 처리
                Object.keys(changes).forEach((key) => {
                    if (!settingKeys.includes(key as any)) {
                        logger.debug(
                            `기타 스토리지 변경: ${key}`,
                            changes[key],
                        );
                    }
                });
            } catch (error) {
                logger.error("스토리지 변경 처리 중 오류:", error);
            }
        });

        logger.debug("스토리지 리스너 초기화 완료");
    } catch (error) {
        logger.error("스토리지 리스너 초기화 중 오류:", error);
        throw error;
    }
}
