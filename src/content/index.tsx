import { checkExtensionState } from "./core/storage/settingsManager";
import { processImages } from "./utils/imageHandlers/imageProcessor";
import { renderCouponComponent } from "./features/coupang/renderCouponComponent";
import { initDomObserver } from "./utils/observers/domObserver";
import { detectCategoryType } from "./features/coupang/categoryHandler/detectCategory";
import { createRoot } from "react-dom/client";
import App from "../iframe/iframe";
import React from "react";
import { contentServiceManager } from "./core/services/ContentServiceManager";
import { contentMessageService } from "./core/services/ContentMessageService";
import { logger } from "@src/utils/logger";

if (window.self !== window.top) {
    const container = document.getElementById("voim-root");
    if (container) {
        const root = createRoot(container);
        root.render(<App />);
    }
}

// 싱글턴 서비스 초기화
async function initializeServices() {
    try {
        await contentServiceManager.initialize();
        contentMessageService.initialize();

        // 기존 기능들 초기화
        checkExtensionState();
        renderCouponComponent();

        logger.debug("Content script 서비스 초기화 완료");
    } catch (error) {
        logger.error("Content script 서비스 초기화 중 오류:", error);
    }
}

// 서비스 초기화 실행
initializeServices();

document.addEventListener("DOMContentLoaded", () => {
    checkExtensionState();
});

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        checkExtensionState();
    }
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
// 메시지 서비스가 모든 메시지를 처리하므로 중복 리스너 제거

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
        import("./features/coupang/cartHandler").then(
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
