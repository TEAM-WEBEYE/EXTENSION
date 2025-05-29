import {
    collectCoupangReviewData,
    sendReviewSummaryRequest,
} from "../apiSetting/sendReviewSummaryRequest";

interface ReviewRating {
    totalCount: number;
    ratings: number[];
}

interface ReviewSummaryRequestPayload {
    productId: string;
    reviewRating: ReviewRating;
    reviews: string[];
}

const isProductDetailPage = (): boolean =>
    window.location.href.includes("/products/");

const waitForElement = (
    selector: string,
    timeout = 10000,
    interval = 500,
): Promise<Element | null> => {
    return new Promise((resolve) => {
        const existingElement = document.querySelector(selector);
        if (existingElement) return resolve(existingElement);

        let elapsed = 0;
        const timer = setInterval(() => {
            const el = document.querySelector(selector);
            if (el) {
                clearInterval(timer);
                return resolve(el);
            }

            elapsed += interval;
            if (elapsed >= timeout) {
                clearInterval(timer);
                console.warn(
                    `[voim] 요소 "${selector}"를 ${timeout / 1000}초 안에 찾지 못했습니다.`,
                );
                resolve(null);
            }
        }, interval);
    });
};

const delay = (ms: number): Promise<void> =>
    new Promise((res) => setTimeout(res, ms));

const extractReviews = (): ReviewSummaryRequestPayload | null => {
    try {
        // 상품 ID 추출
        const productId = window.location.pathname.split("/").pop() || "";

        // 별점 컨테이너 찾기
        const starContainer = document.querySelector(
            ".review-star-search-selector, .sdp-review__article__order__star__option",
        );

        if (!starContainer) {
            console.error("[voim] 별점 컨테이너를 찾을 수 없습니다.");
            return null;
        }

        // 총 리뷰 수 추출
        const totalCountElement = starContainer.querySelector(
            ".review-star-search-item:first-child .review-star-search-item-counts, .js_reviewArticleOptionStarAllCount",
        );
        const totalCount = parseInt(
            totalCountElement?.textContent?.replace(/,/g, "") || "0",
            10,
        );

        // 별점 데이터 추출
        const ratings = [0, 0, 0, 0, 0]; // [최고, 좋음, 보통, 별로, 나쁨]
        const starItems = starContainer.querySelectorAll(
            ".review-star-search-item, .sdp-review__article__order__star__list__item",
        );

        starItems.forEach((item) => {
            // 새로운 구조 처리
            const descElement = item.querySelector(
                ".review-star-search-item-desc",
            );
            const countElement = item.querySelector(
                ".review-star-search-item-counts, .sdp-review__article__order__star__list__item__count",
            );

            if (descElement) {
                // 새로운 구조
                const desc = descElement.textContent?.trim() || "";
                const count = parseInt(
                    countElement?.textContent?.replace(/,/g, "") || "0",
                    10,
                );

                switch (desc) {
                    case "최고":
                        ratings[0] = count;
                        break;
                    case "좋음":
                        ratings[1] = count;
                        break;
                    case "보통":
                        ratings[2] = count;
                        break;
                    case "별로":
                        ratings[3] = count;
                        break;
                    case "나쁨":
                        ratings[4] = count;
                        break;
                }
            } else {
                // 기존 구조
                const rating = item.getAttribute("data-rating");
                const count = parseInt(
                    countElement?.textContent?.replace(/,/g, "") || "0",
                    10,
                );

                if (rating) {
                    const index = 5 - parseInt(rating, 10); // 5점은 0번 인덱스, 1점은 4번 인덱스
                    if (index >= 0 && index < 5) {
                        ratings[index] = count;
                    }
                }
            }
        });

        // 리뷰 텍스트 추출
        const reviewElements = document.querySelectorAll(
            ".sdp-review__article__list__review__content, .review-content",
        );

        const reviews = Array.from(reviewElements).map((element) => {
            const text = element.textContent || "";
            return text.replace(/<br>/g, "\n").trim();
        });

        const result = {
            productId,
            reviewRating: {
                totalCount,
                ratings,
            },
            reviews,
        };

        return result;
    } catch (error) {
        console.error("[voim] 리뷰 데이터 추출 중 오류:", error);
        return null;
    }
};

const initAutoCollectReview = async (): Promise<void> => {
    if (!isProductDetailPage()) {
        return;
    }

    try {
        // 페이지 초기 로드 대기

        await delay(2000);

        const reviewData = extractReviews();
        if (!reviewData) {
            console.error("[voim] 리뷰 데이터를 수집하지 못했습니다.");
            return;
        }

        await delay(1000);

        const summary = await sendReviewSummaryRequest(reviewData);

        chrome.storage.local.set({
            [`review_summary_${reviewData.productId}`]: summary,
        });
    } catch (error) {
        console.error("[voim] 리뷰 자동 수집 중 오류 발생:", error);
        // 재시도 로직
        setTimeout(initAutoCollectReview, 5000);
    }
};

// 페이지가 준비된 후 자동 실행
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAutoCollectReview);
} else {
    initAutoCollectReview();
}
