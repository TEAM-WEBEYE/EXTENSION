import {
    collectCoupangReviewData,
    sendReviewSummaryRequest,
} from "../apiSetting/sendReviewSummaryRequest";

interface ReviewSummary {
    totalCount: number;
    averageRating: number;
    positiveReviews: string[];
    negativeReviews: string[];
    keywords: string[];
}

const isProductDetailPage = (): boolean => {
    return window.location.href.includes("/products/");
};

const waitForElement = (
    selector: string,
    timeout = 10000,
    interval = 1000,
): Promise<Element | null> => {
    return new Promise((resolve) => {
        const element = document.querySelector(selector);
        if (element) {
            return resolve(element);
        }

        let timeElapsed = 0;
        const timer = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(timer);
                resolve(element);
            }

            timeElapsed += interval;
            if (timeElapsed >= timeout) {
                clearInterval(timer);
                console.error(
                    `[voim] 요소 ${selector}를 ${
                        timeout / 1000
                    }초 안에 찾지 못했습니다.`,
                );
                resolve(null);
            }
        }, interval);
    });
};

const initAutoCollectReview = async () => {
    if (!isProductDetailPage()) {
        return;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
        // 첫 번째 케이스 체크
        let starContainer = await waitForElement(
            ".review-star-search-selector, .sdp-review__article__order__star__option",
        );

        if (!starContainer) {
            console.error("[voim] 별점 컨테이너 로드 실패");
            return;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const reviewSections = await waitForElement(
            ".review-star-search-item-counts, .js_reviewArticleOptionStarAllCount",
        );
        if (!reviewSections) {
            console.error("[voim] 리뷰 섹션 로드 실패");
            return;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const reviewData = await collectCoupangReviewData();
        if (!reviewData) {
            console.error("[voim] 리뷰 데이터를 수집할 수 없습니다.");
            return;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const summary = await sendReviewSummaryRequest(reviewData);

        chrome.storage.local.set(
            {
                [`review_summary_${reviewData.productId}`]: summary,
            },
            () => {},
        );
    } catch (error) {
        console.error("[voim] 리뷰 데이터 자동 수집 중 오류:", error);
    }
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAutoCollectReview);
} else {
    initAutoCollectReview();
}
