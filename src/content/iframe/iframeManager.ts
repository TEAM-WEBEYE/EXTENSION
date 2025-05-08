import { EXTENSION_IFRAME_ID } from "../constants";

let iframeVisible = false;
let savedIframeElement: HTMLIFrameElement | null = null;

/**
 * iframe의 resize 메시지를 처리하는 함수를 생성합니다.
 * @param iframe 메시지를 처리할 iframe 요소
 * @returns 메시지 이벤트 핸들러 함수
 */
function handleResizeMessageFactory(iframe: HTMLIFrameElement) {
    return function handleResizeMessage(event: MessageEvent) {
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
}

/**
 * 플로팅 버튼 iframe을 생성합니다.
 */
export function createIframe(): void {
    if (!document.getElementById(EXTENSION_IFRAME_ID)) {
        const iframe = document.createElement("iframe");
        iframe.id = EXTENSION_IFRAME_ID;
        iframe.src = chrome.runtime.getURL("iframe.html");

        iframe.onerror = function (error: Event | string) {
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

        const listener = handleResizeMessageFactory(iframe);
        window.addEventListener("message", listener);
        iframe.dataset.listenerId = String(Date.now());
        (iframe as any)._listener = listener;

        document.body.appendChild(iframe);
        iframeVisible = true;
        savedIframeElement = iframe;
    }
}

/**
 * iframe을 제거합니다.
 */
export function removeIframe(): void {
    const iframe = document.getElementById(
        EXTENSION_IFRAME_ID,
    ) as HTMLIFrameElement;
    if (iframe) {
        window.removeEventListener("message", (iframe as any)._listener);

        savedIframeElement = iframe;
        iframe.remove();
        iframeVisible = false;
    }
}

/**
 * iframe을 복원합니다.
 */
export function restoreIframe(): void {
    if (!iframeVisible && savedIframeElement) {
        const listener = handleResizeMessageFactory(savedIframeElement);
        window.addEventListener("message", listener);
        savedIframeElement.dataset.listenerId = String(Date.now());
        (savedIframeElement as any)._listener = listener;

        document.body.appendChild(savedIframeElement);
        iframeVisible = true;
    } else if (!iframeVisible) {
        createIframe();
    }
}

/**
 * iframe의 가시성 상태를 반환합니다.
 */
export function isIframeVisible(): boolean {
    return iframeVisible;
}

/**
 * iframe을 가시적인 상태로 설정합니다.
 */
export function setIframeVisible(visible: boolean): void {
    iframeVisible = visible;
}
