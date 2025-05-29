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
        console.log("[voim] extractReviews 시작");

        // 상품 ID 추출
        const productId = window.location.pathname.split("/").pop() || "";
        console.log("[voim] 추출된 상품 ID:", productId);

        // 별점 컨테이너 찾기
        const starContainer = document.querySelector(
            ".sdp-review__article__order__star__option",
        );
        console.log("[voim] 별점 컨테이너:", starContainer);

        if (!starContainer) {
            console.error("[voim] 별점 컨테이너를 찾을 수 없습니다.");
            return null;
        }

        // 총 리뷰 수 추출
        const totalCountElement = starContainer.querySelector(
            ".js_reviewArticleOptionStarAllCount",
        );
        const totalCount = parseInt(
            totalCountElement?.textContent?.replace(/,/g, "") || "0",
            10,
        );
        console.log("[voim] 총 리뷰 수:", totalCount);

        // 별점 데이터 추출
        const ratings = [0, 0, 0, 0, 0]; // [최고, 좋음, 보통, 별로, 나쁨]
        const starItems = starContainer.querySelectorAll(
            ".sdp-review__article__order__star__list__item",
        );
        console.log("[voim] 찾은 별점 항목 수:", starItems.length);

        starItems.forEach((item) => {
            const rating = item.getAttribute("data-rating");
            const countElement = item.querySelector(
                ".sdp-review__article__order__star__list__item__count",
            );
            const count = parseInt(
                countElement?.textContent?.replace(/,/g, "") || "0",
                10,
            );

            console.log("[voim] 별점 항목 처리:", {
                rating,
                countText: countElement?.textContent,
                parsedCount: count,
            });

            if (rating) {
                const index = 5 - parseInt(rating, 10); // 5점은 0번 인덱스, 1점은 4번 인덱스
                if (index >= 0 && index < 5) {
                    ratings[index] = count;
                    console.log(
                        `[voim] ${rating}점(${index}번 인덱스)에 ${count}개 할당`,
                    );
                }
            }
        });

        console.log("[voim] 추출된 별점:", ratings);

        // 리뷰 텍스트 추출
        const reviewElements = document.querySelectorAll(
            ".sdp-review__article__list__review__content",
        );
        console.log("[voim] 찾은 리뷰 수:", reviewElements.length);

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

        console.log("[voim] 최종 추출 데이터:", result);
        return result;
    } catch (error) {
        console.error("[voim] 리뷰 데이터 추출 중 오류:", error);
        return null;
    }
};

const initAutoCollectReview = async (): Promise<void> => {
    console.log("[voim] initAutoCollectReview 시작");
    if (!isProductDetailPage()) {
        console.log("[voim] 상품 상세 페이지가 아닙니다.");
        return;
    }

    try {
        // 페이지 초기 로드 대기
        console.log("[voim] 페이지 로드 대기 중...");
        await delay(2000);

        console.log("[voim] 리뷰 데이터 수집 시작");
        const reviewData = extractReviews();
        if (!reviewData) {
            console.error("[voim] 리뷰 데이터를 수집하지 못했습니다.");
            return;
        }
        console.log("[voim] 수집된 리뷰 데이터:", reviewData);

        await delay(1000);

        console.log("[voim] 리뷰 요약 요청 시작");
        const summary = await sendReviewSummaryRequest(reviewData);
        console.log("[voim] 리뷰 요약 응답:", summary);

        chrome.storage.local.set(
            {
                [`review_summary_${reviewData.productId}`]: summary,
            },
            () => {
                console.info(
                    `[voim] 리뷰 요약 데이터를 저장했습니다: review_summary_${reviewData.productId}`,
                );
            },
        );
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
