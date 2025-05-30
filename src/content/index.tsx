import { checkExtensionState } from "./storage/settingsManager";
import { handleStyleMessage } from "./messageHandlers/styleMessageHandler";
import { handleModalMessage } from "./messageHandlers/modalMessageHandler";
import { processImages } from "./imageHandlers/imageProcessor";
import { renderCouponComponent } from "./coupang/renderCouponComponent";
import { initDomObserver } from "./observers/domObserver";
import { detectCategoryType } from "./coupang/categoryHandler/detectCategory";
import { createRoot } from "react-dom/client";
import App from "../iframe/iframe";
import React from "react";

if (window.self !== window.top) {
    const container = document.getElementById("voim-root");
    if (container) {
        const root = createRoot(container);
        root.render(<App />);
    }
}

checkExtensionState();

document.addEventListener("DOMContentLoaded", () => {
    checkExtensionState();
});

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        checkExtensionState();
    }
});

renderCouponComponent();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleStyleMessage(message, sendResponse);
    return true;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    return handleModalMessage(message, sendResponse);
});

initDomObserver(() => true);

processImages();

export const observeAndStoreCategoryType = async () => {
    const isCoupangProductPage =
        /^https:\/\/www\.coupang\.com\/vp\/products\/[0-9]+/.test(
            location.href,
        );

    if (!isCoupangProductPage) {
        chrome.storage.local.set({ "voim-category-type": "none" });
        return;
    }

    const category = await detectCategoryType();

    chrome.storage.local.set({ "voim-category-type": category }, () => {
        if (chrome.runtime.lastError) {
            console.error(
                "[voim] 카테고리 저장 실패:",
                chrome.runtime.lastError.message,
            );
        }
    });
    const observer = new MutationObserver(() => {
        const type = detectCategoryType();
        if (type !== "none") {
            chrome.storage.local.set({ "voim-category-type": type });
            clearTimeout(timeoutId);
            observer.disconnect();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    const timeoutId = setTimeout(() => {
        chrome.storage.local.set({ "voim-category-type": "none" });
        observer.disconnect();
    }, 1500);
};
observeAndStoreCategoryType();

const waitForEl = (
    selector: string,
    timeout = 10000,
): Promise<Element | null> => {
    return new Promise((resolve) => {
        const el = document.querySelector(selector);
        if (el) return resolve(el);

        const observer = new MutationObserver(() => {
            const found = document.querySelector(selector);
            if (found) {
                observer.disconnect();
                resolve(found);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        setTimeout(() => {
            observer.disconnect();
            resolve(null);
        }, timeout);
    });
};
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_PRODUCT_TITLE") {
        const titleEl = document.querySelector("h1.prod-buy-header__title");
        const title = titleEl?.textContent?.trim() ?? "";
        console.debug("[voim][content] 추출된 title:", title);
        sendResponse({ title });
        return true;
    }
    return false;
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_VENDOR_HTML") {
        waitForEl(".vendor-item").then((vendorEl) => {
            if (!vendorEl) {
                console.warn("[voim][content] .vendor-item 감지 실패");
                sendResponse({ html: "", productId: "" });
                return;
            }

            const rawHtml = vendorEl.outerHTML
                .replace(/\sonerror=\"[^\"]*\"/g, "")
                .replace(/\n/g, "")
                .trim();

            const match = window.location.href.match(/products\/(\d+)/);
            const productId = match?.[1] ?? "";

            sendResponse({ html: rawHtml, productId });
        });

        return true;
    }
});

const isProductDetailPage = () => {
    return window.location.href.includes("/products/");
};

const isCartPage = () => {
    return window.location.href.includes("cart.coupang.com/cartView.pang");
};

const sendMessageToIframe = (isProductPage: boolean, isCart: boolean) => {
    const iframe = document.querySelector(
        "#floating-button-extension-iframe",
    ) as HTMLIFrameElement;

    if (iframe) {
        try {
            iframe.contentWindow?.postMessage(
                { type: "PAGE_TYPE", value: isProductPage },
                "*",
            );
            iframe.contentWindow?.postMessage(
                { type: "CART_PAGE", value: isCart },
                "*",
            );
        } catch (error) {
            iframe.onload = () => {
                try {
                    iframe.contentWindow?.postMessage(
                        { type: "PAGE_TYPE", value: isProductPage },
                        "*",
                    );
                    iframe.contentWindow?.postMessage(
                        { type: "CART_PAGE", value: isCart },
                        "*",
                    );
                } catch (error) {}
            };
        }
    }
};

const waitForIframeAndSend = () => {
    setTimeout(() => {
        sendMessageToIframe(isProductDetailPage(), isCartPage());
    }, 500);
};

let lastUrl = window.location.href;
const urlObserver = new MutationObserver(() => {
    if (lastUrl !== window.location.href) {
        lastUrl = window.location.href;
        if (isProductDetailPage() || isCartPage()) {
            waitForIframeAndSend();
        }
    }
});

window.addEventListener("message", (event) => {
    if (event.data.type === "REQUEST_PAGE_TYPE") {
        sendMessageToIframe(isProductDetailPage(), isCartPage());
    }
});

if (isProductDetailPage() || isCartPage()) {
    waitForIframeAndSend();
    urlObserver.observe(document, { subtree: true, childList: true });
}

// 장바구니 데이터 추출 및 전송
const extractAndSendCartData = () => {
    if (isCartPage()) {
        import("./coupang/cartHandler").then(
            ({ sendCartItemsToBackground }) => {
                sendCartItemsToBackground();
            },
        );
    }
};

// DOM 변화 감지하여 장바구니 데이터 업데이트
const observeCartChanges = () => {
    if (isCartPage()) {
        const observer = new MutationObserver(() => {
            extractAndSendCartData();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }
};

// 초기 실행
extractAndSendCartData();
observeCartChanges();
