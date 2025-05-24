import {
    checkExtensionState,
    initCursorSettings,
} from "./storage/settingsManager";
import { handleStyleMessage } from "./messageHandlers/styleMessageHandler";
import { handleCursorMessage } from "./messageHandlers/cursorMessageHandler";
import { handleModalMessage } from "./messageHandlers/modalMessageHandler";
import { processImages } from "./imageHandlers/imageProcessor";
import { MountCartSummaryApp } from "./coupang/CartSummary";
import { checkCategoryCosmeticAndRender } from "./coupang/categoryHandler/categoryHandlerCosmetic";
import { checkCategoryFoodAndRender } from "./coupang/categoryHandler/categoryHandlerFood";
import { checkCategoryHealthAndRender } from "./coupang/categoryHandler/categoryHandlerHealth";
import { renderCouponComponent } from "./coupang/renderCouponComponent";
import { renderInfoComponent } from "../content/coupang/renderInfoComponent";
import { initDomObserver } from "./observers/domObserver";

renderInfoComponent();
checkExtensionState();

document.addEventListener("DOMContentLoaded", () => {
    checkExtensionState();
});

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        checkExtensionState();
    }
});
window.addEventListener("load", () => {
    setTimeout(() => {
        renderCouponComponent();
    }, 1500);
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

initDomObserver(() => {
    return true;
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
        checkCategoryFoodAndRender();
    });
} else {
    checkCategoryFoodAndRender();
}
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        checkCategoryCosmeticAndRender();
    });
} else {
    checkCategoryCosmeticAndRender();
}
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        checkCategoryHealthAndRender();
    });
} else {
    checkCategoryHealthAndRender();
}
