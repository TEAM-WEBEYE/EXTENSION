const EXTENSION_IFRAME_ID = "floating-button-extension-iframe";

export const handleModalMessage = (
    message: { action: string },
    sendResponse: (response: any) => void,
) => {
    if (message.action === "TOGGLE_MODAL") {
        chrome.storage.local.get(["stylesEnabled"], (result) => {
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
    }

    return false;
};
