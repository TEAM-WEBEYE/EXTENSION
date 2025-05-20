import { EXTENSION_IFRAME_ID } from "../constants";
import { STORAGE_KEYS } from "../../background/constants";

let savedIframeElement: HTMLIFrameElement | null = null;
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
 * iframe의 가시성 상태를 가져옵니다.
 */
async function getIframeVisibility(): Promise<boolean> {
    const result = await chrome.storage.sync.get([STORAGE_KEYS.IFRAME_VISIBLE]);
    return result[STORAGE_KEYS.IFRAME_VISIBLE] ?? true;
}

/**
 * iframe의 가시성 상태를 설정합니다.
 */
async function setIframeVisibility(visible: boolean): Promise<void> {
    await chrome.storage.sync.set({ [STORAGE_KEYS.IFRAME_VISIBLE]: visible });
}

/**
 * 플로팅 버튼 iframe을 생성합니다.
 */
export async function createIframe(): Promise<void> {
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
        await setIframeVisibility(true);
        savedIframeElement = iframe;
    }
}

/**
 * iframe을 제거합니다.
 */
export async function removeIframe(): Promise<void> {
    const iframe = document.getElementById(
        EXTENSION_IFRAME_ID,
    ) as HTMLIFrameElement;
    if (iframe) {
        // 리스너 제거
        if (currentListener) {
            window.removeEventListener("message", currentListener);
            currentListener = null;
        }

        savedIframeElement = iframe;
        iframe.remove();
        await setIframeVisibility(false);
    }
}

/**
 * iframe을 복원합니다.
 */
export async function restoreIframe(): Promise<void> {
    const isVisible = await getIframeVisibility();
    if (!isVisible && savedIframeElement) {
        // iframe을 완전히 초기 상태로 리셋
        resetIframeState(savedIframeElement);

        // 기존 리스너 제거
        if (currentListener) {
            window.removeEventListener("message", currentListener);
        }

        // 새 리스너 설정
        currentListener = handleResizeMessageFactory(savedIframeElement);
        window.addEventListener("message", currentListener);

        document.body.appendChild(savedIframeElement);
        await setIframeVisibility(true);
    } else if (!isVisible) {
        await createIframe();
    }
}

/**
 * iframe의 가시성 상태를 반환합니다.
 */
export async function isIframeVisible(): Promise<boolean> {
    return await getIframeVisibility();
}

/**
 * iframe을 가시적인 상태로 설정합니다.
 */
export async function setIframeVisible(visible: boolean): Promise<void> {
    await setIframeVisibility(visible);
    if (visible) {
        await restoreIframe();
    } else {
        await removeIframe();
    }
}
