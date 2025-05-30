export async function handleIconToggle(): Promise<void> {
    const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
    });

    if (tabs[0]?.id) {
        await chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: function () {
                const iframeId = "floating-button-extension-iframe";
                let iframe = document.getElementById(
                    iframeId,
                ) as HTMLIFrameElement;

                // 항상 iframeHiddenByAltA 먼저 검사
                chrome.storage.local.get(
                    [
                        "iframeInvisible",
                        "iframeHiddenByAltA",
                        "iframeHiddenByAltV",
                    ],
                    (result) => {
                        const isInvisible = result.iframeInvisible ?? false;
                        const hiddenByAltV = result.iframeHiddenByAltV ?? false;
                        const hiddenByAltA = result.iframeHiddenByAltA ?? false;

                        if (!iframe) {
                            // Alt+V로 숨겨진 상태일 때만 iframe 생성
                            if (isInvisible) {
                                iframe = document.createElement("iframe");
                                iframe.id = iframeId;
                                iframe.src =
                                    chrome.runtime.getURL("iframe.html");
                                iframe.setAttribute("tabindex", "1");

                                iframe.style.position = "fixed";
                                iframe.style.top = "70px";
                                iframe.style.right = "20px";
                                iframe.style.width = "65px";
                                iframe.style.height = "130px";
                                iframe.style.border = "none";
                                iframe.style.background = "transparent";
                                iframe.style.zIndex = "2147483647";

                                iframe.onload = () => {
                                    iframe.focus();
                                    iframe.contentWindow?.document
                                        .getElementById("root")
                                        ?.focus();
                                };

                                const handleMessage = function (
                                    event: MessageEvent,
                                ) {
                                    if (event.source !== iframe.contentWindow)
                                        return;

                                    if (event.data.type === "RESIZE_IFRAME") {
                                        if (event.data.isOpen) {
                                            iframe.style.width = "100%";
                                            iframe.style.height = "100%";
                                            iframe.style.top = "0";
                                            iframe.style.right = "0";
                                        } else {
                                            iframe.style.width = "65px";
                                            iframe.style.height = "130px";
                                            iframe.style.top = "70px";
                                            iframe.style.right = "20px";
                                        }
                                    }
                                };
                                window.addEventListener(
                                    "message",
                                    handleMessage,
                                );
                                document.body.appendChild(iframe);

                                chrome.storage.local.set({
                                    iframeInvisible: false,
                                    iframeHiddenByAltA: false,
                                    iframeHiddenByAltV: true,
                                });

                                iframe.onload = function () {
                                    if (iframe.contentWindow) {
                                        iframe.contentWindow.postMessage(
                                            { type: "TOGGLE_MODAL" },
                                            "*",
                                        );
                                    }
                                };
                            }
                        } else {
                            // iframe이 이미 존재할 때
                            if (iframe.contentWindow) {
                                iframe.contentWindow.postMessage(
                                    { type: "TOGGLE_MODAL" },
                                    "*",
                                );

                                if (hiddenByAltV) {
                                    iframe.remove();
                                    chrome.storage.local.set({
                                        iframeInvisible: true,
                                        iframeHiddenByAltA: false,
                                        iframeHiddenByAltV: false,
                                    });
                                }
                            }
                        }
                        if (isInvisible && hiddenByAltA) {
                            chrome.storage.local.set({
                                iframeInvisible: false,
                                iframeHiddenByAltA: false,
                                iframeHiddenByAltV: false,
                            });
                        }
                    },
                );
            },
        });
    }
}
