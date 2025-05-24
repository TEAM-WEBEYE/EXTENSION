import { logger } from "@src/utils/logger";
import { settingsService } from "../services/settingsService";

export async function handleStyleToggle(): Promise<void> {
    const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
    });

    if (tabs[0]?.id) {
        // 현재 스타일 상태 확인
        const currentStyleState = await chrome.storage.local.get([
            "stylesEnabled",
        ]);
        const isStylesEnabled = currentStyleState.stylesEnabled ?? true;

        // settingsService의 상태 동기화
        settingsService.setStylesEnabled(isStylesEnabled);

        await chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: function () {
                const iframeId = "floating-button-extension-iframe";
                const existingIframe = document.getElementById(iframeId);

                if (existingIframe) {
                    // iframe이 있으면 제거
                    existingIframe.remove();
                    chrome.storage.local.set(
                        {
                            iframeInvisible: true,
                            iframeHiddenByAltA: true,
                        },
                        () => {
                            console.log("iframe 숨김 상태로 변경됨 (ALT + A)");
                        },
                    );
                } else {
                    // iframe이 없으면 생성
                    const iframe = document.createElement("iframe");
                    iframe.id = iframeId;
                    iframe.src = chrome.runtime.getURL("iframe.html");

                    iframe.style.position = "fixed";
                    iframe.style.top = "70px";
                    iframe.style.right = "20px";
                    iframe.style.width = "65px";
                    iframe.style.height = "65px";
                    iframe.style.border = "none";
                    iframe.style.background = "transparent";
                    iframe.style.zIndex = "2147483647";

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
                    chrome.storage.local.set(
                        {
                            iframeInvisible: false,
                            iframeHiddenByAltA: false,
                        },
                        () => {
                            console.log("iframe 보임 상태로 변경됨");
                        },
                    );
                }
            },
        });

        // 스타일 상태 토글
        if (isStylesEnabled) {
            // 스타일이 켜져있으면 끄기
            await chrome.tabs.sendMessage(tabs[0].id, {
                type: "DISABLE_ALL_STYLES",
            });
            await chrome.storage.local.set({
                stylesEnabled: false,
            });
            settingsService.setStylesEnabled(false);
        } else {
            // 스타일이 꺼져있으면 켜기
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
