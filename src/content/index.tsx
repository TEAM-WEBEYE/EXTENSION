import {
    checkExtensionState,
    initCursorSettings,
} from "./storage/settingsManager";
import { handleStyleMessage } from "./messageHandlers/styleMessageHandler";
import { handleCursorMessage } from "./messageHandlers/cursorMessageHandler";
import { handleModalMessage } from "./messageHandlers/modalMessageHandler";
import { createStyleObserver } from "./observers/styleObserver";
import { processImages } from "./imageHandlers/imageProcessor";
import { MountCartSummaryApp } from "./coupang/cartSummary";
import { checkCategoryAndRender } from "./coupang/categoryHandler";

checkExtensionState();

document.addEventListener("DOMContentLoaded", () => {
    checkExtensionState();
});

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        checkExtensionState();
    }
});

initCursorSettings();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleStyleMessage(message, sendResponse);
    return true;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    return handleCursorMessage(message, sendResponse);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    return handleModalMessage(message, sendResponse);
});

const observer = createStyleObserver();
observer.observe(document.body, {
    childList: true,
    subtree: true,
});

processImages();

if (location.href.includes("cart.coupang.com/cartView.pang")) {
    window.addEventListener("load", () => {
        setTimeout(() => {
            MountCartSummaryApp();
        }, 500);
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        checkCategoryAndRender();
    });
} else {
    checkCategoryAndRender();
}
