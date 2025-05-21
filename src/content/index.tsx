import {
    checkExtensionState,
    initCursorSettings,
} from "./storage/settingsManager";
import { handleStyleMessage } from "./messageHandlers/styleMessageHandler";
import { handleCursorMessage } from "./messageHandlers/cursorMessageHandler";
import { handleModalMessage } from "./messageHandlers/modalMessageHandler";
import { processImages } from "./imageHandlers/imageProcessor";
import { MountCartSummaryApp } from "./coupang/cartSummary";
import { MountReviewSummaryApp } from "./coupang/reviewSummary";
import { checkCategoryAndRender } from "./coupang/categoryHandler";
import { initDomObserver } from "./observers/domObserver";
import { parseReviewSections } from "./coupang/parseReviw";

checkExtensionState();

function onProductPage() {
    return location.href.includes("coupang.com/vp/products/");
}

function observeReviewSection() {
    const observer = new MutationObserver((mutations, obs) => {
        const reviewSection = document.querySelector(
            ".review-summary-survey-section",
        );

        if (reviewSection) {
            obs.disconnect();
            console.log("리뷰 섹션 로드됨");

            const reviewData = parseReviewSections();
            console.log("Parsed Review Sections:", reviewData);

            processReviewData();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

function runContentScript() {
    checkCategoryAndRender();

    if (onProductPage()) {
        observeReviewSection();

        const reviewSection = document.querySelector(
            ".review-summary-survey-section",
        );

        if (reviewSection) {
            console.log("리뷰 섹션 이미 로드됨");

            const reviewData = parseReviewSections();
            console.log("Parsed Review Sections:", reviewData);

            processReviewData();
        }
    }
}

let lastUrl = location.href;
setInterval(() => {
    if (location.href !== lastUrl) {
        lastUrl = location.href;
        runContentScript();
    }
}, 1000);

runContentScript();

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

function extractProductId(url: string): string | null {
    const match = url.match(/\/products\/(\d+)/);
    return match ? match[1] : null;
}

function parseReviewRating() {
    const ratingItems = document.querySelectorAll(".review-star-search-item");
    console.log("찾은 항목 수:", ratingItems.length);

    const ratings = {
        total: 0,
        five: 0,
        four: 0,
        three: 0,
        two: 0,
        one: 0,
    };

    ratingItems.forEach((item) => {
        const desc = item
            .querySelector(".review-star-search-item-desc")
            ?.textContent?.trim();
        const countText = item.querySelector(
            ".review-star-search-item-counts",
        )?.textContent;
        const count = parseInt(countText?.replace(/,/g, "") || "0");

        console.log("desc:", desc, "count:", count);

        if (desc === "모든 별점 보기") ratings.total = count;
        else if (desc === "최고") ratings.five = count;
        else if (desc === "좋음") ratings.four = count;
        else if (desc === "보통") ratings.three = count;
        else if (desc === "별로") ratings.two = count;
        else if (desc === "나쁨") ratings.one = count;
    });

    return ratings;
}
async function waitForRatingItems(timeout = 5000) {
    const interval = 100;
    let waited = 0;
    while (waited < timeout) {
        const items = document.querySelectorAll(".review-star-search-item");
        if (items.length > 0) return items;
        await new Promise((r) => setTimeout(r, interval));
        waited += interval;
    }
    return null;
}

async function processReviewData() {
    try {
        await waitForRatingItems();
        const ratingData = parseReviewRating();
        console.log("⭐️ 별점 데이터:", ratingData);

        const productId = extractProductId(location.href);
        const reviewData = parseReviewSections();

        const combinedData = {
            productId,
            reviews: reviewData,
            reviewRating: ratingData,
        };

        console.log("📦 API 전송 데이터:", combinedData);

        chrome.runtime.sendMessage(
            {
                type: "ANALYZE_COUPANG_REVIEWS",
                payload: combinedData,
            },
            (response) => {
                if (response && response.success) {
                    console.log("리뷰 분석 요청 성공:", response);
                    if (response.result) {
                        console.log("⭐️ 리뷰 분석 결과:", response.result);
                        MountReviewSummaryApp(response.result);
                    }
                } else {
                    console.error(
                        "리뷰 분석 요청 실패:",
                        response ? response.error : "Unknown error",
                    );
                    MountReviewSummaryApp({
                        error: response ? response.error : "알 수 없는 오류",
                    });
                }
            },
        );
    } catch (e) {
        console.error("❌ 데이터 파싱 오류:", e);
        MountReviewSummaryApp({
            error: "데이터 파싱 중 오류가 발생했습니다",
        });
    }
}
