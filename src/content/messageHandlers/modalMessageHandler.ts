const EXTENSION_IFRAME_ID = "floating-button-extension-iframe";

export const handleModalMessage = (
    message: { action: string },
    sendResponse: (response: any) => void,
) => {
    if (message.action === "TOGGLE_MODAL") {
        chrome.storage.sync.get(["stylesEnabled"], (result) => {
            const stylesEnabled =
                result.stylesEnabled !== undefined
                    ? result.stylesEnabled
                    : true;

            const iframe = document.getElementById(EXTENSION_IFRAME_ID);
            if (iframe instanceof HTMLIFrameElement && iframe.contentWindow) {
                iframe.contentWindow.postMessage({ type: "TOGGLE_MODAL" }, "*");
            }
            sendResponse({ success: true });
        });
        return true;
    } else if (message.action === "TOGGLE_CURSOR") {
        chrome.storage.sync.get(["stylesEnabled"], (result) => {
            const stylesEnabled =
                result.stylesEnabled !== undefined
                    ? result.stylesEnabled
                    : true;

            if (!stylesEnabled) {
                console.log(
                    "스타일이 비활성화 상태입니다. 커서 토글을 적용하지 않습니다.",
                );
                sendResponse({
                    success: false,
                    error: "스타일이 비활성화 상태입니다",
                });
                return;
            }

            const iframe = document.getElementById(EXTENSION_IFRAME_ID);
            if (iframe instanceof HTMLIFrameElement && iframe.contentWindow) {
                iframe.contentWindow.postMessage(
                    { type: "TOGGLE_CURSOR" },
                    "*",
                );
            }
            sendResponse({ success: true });
        });
        return true;
    }

    return false;
};
