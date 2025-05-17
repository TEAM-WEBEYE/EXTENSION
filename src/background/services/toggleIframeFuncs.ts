import { EXTENSION_IFRAME_ID } from "../constants";
import { logger } from "../../utils/logger";

/**
 * 플로팅 iframe을 토글하는 함수
 * content script에 주입하여 사용됩니다.
 */
export function toggleFloatingIframe() {
    try {
        logger.debug("toggleFloatingIframe 함수 실행");

        const existingIframe = document.getElementById(EXTENSION_IFRAME_ID);

        if (existingIframe) {
            logger.debug("기존 iframe을 제거합니다");
            existingIframe.remove();
            return;
        }

        logger.debug("새 iframe을 생성합니다");
        const iframe = document.createElement("iframe");
        iframe.id = EXTENSION_IFRAME_ID;
        iframe.src = chrome.runtime.getURL("iframe.html");

        iframe.onerror = function (error) {
            console.error("Failed to load iframe:", error);
        };

        iframe.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            width: 65px;
            height: 65px;
            border: none;
            background: transparent;
            z-index: 2147483647;
        `;

        // 메시지 이벤트 리스너 추가
        const handleMessage = function (event: MessageEvent) {
            if (event.source !== iframe.contentWindow) {
                return;
            }

            if (event.data.type === "RESIZE_IFRAME") {
                if (event.data.isOpen) {
                    iframe.style.width = "100%";
                    iframe.style.height = "100%";
                    iframe.style.top = "0";
                    iframe.style.right = "0";
                } else {
                    iframe.style.width = "65px";
                    iframe.style.height = "65px";
                    iframe.style.top = "70px";
                    iframe.style.right = "20px";
                }
            }
        };

        window.addEventListener("message", handleMessage);

        // iframe에 참조 저장하여 나중에 제거할 때 사용
        iframe.dataset.messageListener = "true";

        document.body.appendChild(iframe);
        logger.debug("iframe이 문서에 추가되었습니다");
    } catch (error) {
        console.error("iframe 토글 중 오류:", error);
    }
}

/**
 * Chrome의 scripting.executeScript API에서 직접 사용할 수 있는
 * 독립형 함수 - 모든 의존성이 내부에 포함됨
 */
export function standaloneToggleIframe() {
    try {
        console.log("iframe 토글 시작");

        const IFRAME_ID = "floating-button-extension-iframe";
        const existingIframe = document.getElementById(IFRAME_ID);

        if (existingIframe) {
            console.log("기존 iframe 제거");
            existingIframe.remove();
            return;
        }

        console.log("새 iframe 생성");
        const iframe = document.createElement("iframe");
        iframe.id = IFRAME_ID;

        // extension URL 직접 생성 (chrome.runtime.getURL 대신)
        const extensionId = chrome.runtime.id;
        iframe.src = `chrome-extension://${extensionId}/iframe.html`;

        iframe.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            width: 65px;
            height: 65px;
            border: none;
            background: transparent;
            z-index: 2147483647;
        `;

        const handleMessage = function (event: MessageEvent) {
            if (event.source !== iframe.contentWindow) {
                return;
            }

            if (event.data.type === "RESIZE_IFRAME") {
                if (event.data.isOpen) {
                    iframe.style.width = "100%";
                    iframe.style.height = "100%";
                    iframe.style.top = "0";
                    iframe.style.right = "0";
                } else {
                    iframe.style.width = "65px";
                    iframe.style.height = "65px";
                    iframe.style.top = "70px";
                    iframe.style.right = "20px";
                }
            }
        };

        window.addEventListener("message", handleMessage);
        document.body.appendChild(iframe);
        console.log("iframe 추가 완료");
    } catch (error) {
        console.error("iframe 토글 중 오류:", error);
    }
}
