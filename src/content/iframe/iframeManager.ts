import { EXTENSION_IFRAME_ID } from "../constants";

let currentListener: ((event: MessageEvent) => void) | null = null;

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
 * iframe을 초기 상태로 설정합니다.
 */
function resetIframeState(iframe: HTMLIFrameElement): void {
    iframe.style.width = "65px";
    iframe.style.height = "65px";
    iframe.style.top = "70px";
    iframe.style.right = "20px";
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

        // 기존 리스너 제거
        if (currentListener) {
            window.removeEventListener("message", currentListener);
        }

        // 새 리스너 설정
        currentListener = handleResizeMessageFactory(iframe);
        window.addEventListener("message", currentListener);

        document.body.appendChild(iframe);

        // iframeInvisible 값을 false로 설정
        chrome.storage.local.set({ iframeInvisible: false }, () => {
            console.log("iframe 보임 상태 저장됨");
        });
    }
}

// 메시지 핸들러 추가
window.addEventListener("message", (event) => {
    if (event.data.type === "SET_IFRAME_VISIBLE") {
        setIframeVisible(event.data.visible);
    }
});

/**
 * iframe을 제거합니다.
 */
export function removeIframe(): void {
    const iframe = document.getElementById(
        EXTENSION_IFRAME_ID,
    ) as HTMLIFrameElement;
    if (iframe) {
        // 리스너 제거
        if (currentListener) {
            window.removeEventListener("message", currentListener);
            currentListener = null;
        }

        iframe.remove();

        // iframeInvisible 값을 true로 설정
        chrome.storage.local.set({ iframeInvisible: true }, () => {
            console.log("iframe 숨김 상태 저장됨");
        });
    }
}

/**
 * iframe을 복원합니다.
 */
export function restoreIframe(): void {
    chrome.storage.local.get(["iframeInvisible"], (result) => {
        const isInvisible = result.iframeInvisible ?? false;
        console.log("현재 iframe 상태:", isInvisible ? "숨김" : "보임");

        if (!isInvisible) {
            createIframe();
        }
    });
}

/**
 * iframe의 가시성 상태를 반환합니다.
 */
export function isIframeVisible(): boolean {
    return document.getElementById(EXTENSION_IFRAME_ID) !== null;
}

/**
 * iframe을 가시적인 상태로 설정합니다.
 */
export function setIframeVisible(visible: boolean): void {
    if (visible) {
        createIframe();
    } else {
        removeIframe();
    }

    chrome.storage.local.set({ iframeInvisible: !visible }, () => {
        console.log("iframe 상태 저장됨:", !visible ? "숨김" : "보임");
    });
}
