export async function handleSidebarToggle(): Promise<void> {
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

                if (!iframe) {
                    // iframeInvisible 상태 확인
                    chrome.storage.local.get(
                        [
                            "iframeInvisible",
                            "iframeHiddenByAltA",
                            "iframeHiddenByAltV",
                        ],
                        (result) => {
                            const isInvisible = result.iframeInvisible ?? false;
                            const hiddenByAltA =
                                result.iframeHiddenByAltA ?? false;
                            if (hiddenByAltA) {
                                // ALT+A로 숨긴 경우에는 iframe을 생성하지 않음
                                return;
                            }

                            // ALT+V로 숨긴 경우에만 iframe 생성하고 사이드바 띄우기
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
                                            { type: "TOGGLE_SIDEBAR" },
                                            "*",
                                        );
                                    }
                                };
                            }
                        },
                    );
                } else {
                    if (iframe.contentWindow) {
                        iframe.contentWindow.postMessage(
                            { type: "TOGGLE_SIDEBAR" },
                            "*",
                        );

                        chrome.storage.local.get(
                            ["iframeHiddenByAltV"],
                            (result) => {
                                const hiddenByAltV =
                                    result.iframeHiddenByAltV ?? false;

                                if (hiddenByAltV) {
                                    iframe.remove();
                                    chrome.storage.local.set({
                                        iframeInvisible: true,
                                        iframeHiddenByAltA: false,
                                        iframeHiddenByAltV: false,
                                    });
                                }
                            },
                        );
                    }
                }
            },
        });
    }
}
