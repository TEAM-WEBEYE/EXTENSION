import { logger } from "@src/utils/logger";
import { settingsService } from "../services/settingsService";

export async function handleStyleToggle(): Promise<void> {
    const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
    });

    if (tabs[0]?.id) {
        const result = await chrome.storage.local.get([
            "iframeHiddenByAltV",
            "stylesEnabled",
        ]);
        const isStylesEnabled = result.stylesEnabled ?? true;
        const wasHiddenByAltV = result.iframeHiddenByAltV ?? false;

        settingsService.setStylesEnabled(isStylesEnabled);

        await chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: (wasHiddenByAltV: boolean) => {
                const iframeId = "floating-button-extension-iframe";
                const existingIframe = document.getElementById(iframeId);
                if (!existingIframe && wasHiddenByAltV) {
                    // ALT+V로 숨겨진 경우에는 iframe을 생성하지 않음
                    chrome.storage.local.set({
                        iframeInvisible: true,
                        iframeHiddenByAltA: true,
                        iframeHiddenByAltV: false,
                    });
                    return;
                }
                if (existingIframe) {
                    existingIframe.remove();
                    chrome.storage.local.set({
                        iframeInvisible: true,
                        iframeHiddenByAltA: true,
                    });
                } else {
                    const iframe = document.createElement("iframe");
                    iframe.id = iframeId;
                    iframe.src = chrome.runtime.getURL("iframe.html");
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
                                iframe.style.height = "130px";
                                iframe.style.top = "70px";
                                iframe.style.right = "20px";
                            }
                        }
                    };

                    window.addEventListener("message", handleMessage);
                    document.body.appendChild(iframe);
                    chrome.storage.local.set({
                        iframeInvisible: false,
                        iframeHiddenByAltA: false,
                        iframeHiddenByAltV: false,
                    });
                }
            },
            args: [wasHiddenByAltV],
        });

        if (isStylesEnabled) {
            await chrome.tabs.sendMessage(tabs[0].id, {
                type: "DISABLE_ALL_STYLES",
            });
            await chrome.storage.local.set({
                stylesEnabled: false,
            });
            settingsService.setStylesEnabled(false);
        } else {
            await chrome.tabs.sendMessage(tabs[0].id, {
                type: "RESTORE_ALL_STYLES",
            });
            await chrome.storage.local.set({
                stylesEnabled: true,
            });
            settingsService.setStylesEnabled(true);
        }
    }
}

export async function handleStyleMessage(enabled: boolean): Promise<void> {
    logger.debug(`스타일 메시지 처리 중: enabled=${enabled}`);
    try {
        const tabs = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });

        if (tabs[0]?.id) {
            if (enabled) {
                await chrome.tabs.sendMessage(tabs[0].id, {
                    type: "RESTORE_ALL_STYLES",
                });
                await chrome.storage.local.set({
                    stylesEnabled: true,
                });
                chrome.storage.local.set({
                    iframeInvisible: false,
                    iframeHiddenByAltA: false,
                });
                settingsService.setStylesEnabled(true);
            } else {
                await chrome.tabs.sendMessage(tabs[0].id, {
                    type: "DISABLE_ALL_STYLES",
                });
                await chrome.storage.local.set({
                    stylesEnabled: false,
                });
                chrome.storage.local.set({
                    iframeInvisible: true,
                    iframeHiddenByAltA: true,
                });
                settingsService.setStylesEnabled(false);
            }
            logger.debug("스타일 메시지 처리 완료");
        }
    } catch (error) {
        logger.error("스타일 메시지 처리 중 오류:", error);
    }
}
