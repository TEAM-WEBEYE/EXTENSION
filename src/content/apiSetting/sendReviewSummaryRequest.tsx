interface ReviewRating {
    totalCount: number;
    ratings: number[];
}

interface ReviewCategory {
    [key: string]: {
        [key: string]: number;
    };
}

interface ReviewSummaryRequestPayload {
    productId: string;
    reviewRating: ReviewRating;
    reviews: string[];
}

interface ReviewSummaryData {
    totalCount: number;
    averageRating: number;
    positiveReviews: string[];
    negativeReviews: string[];
    keywords: string[];
}

interface ReviewSummaryAPIResponse {
    type: string;
    data: ReviewSummaryData;
    message?: string;
}

const waitForElement = (
    selector: string,
    timeout = 10000,
): Promise<Element | null> => {
    return new Promise((resolve) => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(() => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        setTimeout(() => {
            observer.disconnect();
            resolve(null);
        }, timeout);
    });
};

export const collectCoupangReviewData =
    async (): Promise<ReviewSummaryRequestPayload | null> => {
        try {
            // 첫 번째 케이스: .review-star-search-selector
            let starRatingContainer = await waitForElement(
                ".review-star-search-selector",
            );

            // 두 번째 케이스: .sdp-review__article__order__star__option
            if (!starRatingContainer) {
                starRatingContainer = await waitForElement(
                    ".sdp-review__article__order__star__option",
                );
            }

            if (!starRatingContainer) {
                console.error("[voim] 별점 컨테이너를 찾을 수 없습니다.");
                return null;
            }

            // 전체 리뷰 수 수집
            const totalCountText =
                starRatingContainer
                    .querySelector(
                        ".review-star-search-item-counts, .js_reviewArticleOptionStarAllCount",
                    )
                    ?.textContent?.trim() || "0";
            const totalCount = parseInt(totalCountText.replace(/,/g, ""));

            // 별점별 개수 수집
            const ratingsArray: number[] = [0, 0, 0, 0, 0]; // [최고, 좋음, 보통, 별로, 나쁨]
            const starItems = starRatingContainer.querySelectorAll(
                ".review-star-search-item, .sdp-review__article__order__star__list__item",
            );

            starItems.forEach((item) => {
                const ratingText = item
                    .querySelector(
                        ".review-star-search-item-desc, .sdp-review__article__order__star__list__item__content",
                    )
                    ?.textContent?.trim();
                const countText =
                    item
                        .querySelector(
                            ".review-star-search-item-counts, .sdp-review__article__order__star__list__item__count",
                        )
                        ?.textContent?.trim() || "0";

                const count = parseInt(countText.replace(/,/g, ""));
                if (ratingText === "최고") ratingsArray[0] = count;
                else if (ratingText === "좋음") ratingsArray[1] = count;
                else if (ratingText === "보통") ratingsArray[2] = count;
                else if (ratingText === "별로") ratingsArray[3] = count;
                else if (ratingText === "나쁨") ratingsArray[4] = count;
            });

            // 리뷰 텍스트 수집
            const reviewElements = document.querySelectorAll(
                ".review-content, .sdp-review__article__list__review__content",
            );

            const reviews: string[] = [];
            reviewElements.forEach((element) => {
                const reviewText = element.textContent?.trim();
                if (reviewText) {
                    reviews.push(reviewText);
                }
            });

            // productId 추출
            const url = window.location.href;
            const productIdMatch = url.match(/\/products\/(\d+)/);
            const productId = productIdMatch ? productIdMatch[1] : "";

            if (!productId) {
                console.error("[voim] productId를 찾을 수 없습니다.");
                return null;
            }

            // 데이터 유효성 검사
            if (totalCount === 0) {
                console.error("[voim] 리뷰 수가 0입니다.");
                return null;
            }

            if (ratingsArray.every((rating) => rating === 0)) {
                console.error("[voim] 모든 별점이 0입니다.");
                return null;
            }

            if (reviews.length === 0) {
                console.error("[voim] 리뷰 텍스트가 없습니다.");
                return null;
            }

            return {
                productId,
                reviewRating: {
                    totalCount,
                    ratings: ratingsArray,
                },
                reviews,
            };
        } catch (error) {
            console.error("[voim] 리뷰 데이터 수집 중 오류:", error);

            return null;
        }
    };

export const sendReviewSummaryRequest = (
    payload: ReviewSummaryRequestPayload,
): Promise<ReviewSummaryData> => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            {
                type: "FETCH_REVIEW_SUMMARY",
                payload,
            },
            (response: unknown) => {
                if (!response || typeof response !== "object") {
                    return reject(new Error("Invalid response format"));
                }

                const res = response as ReviewSummaryAPIResponse;

                if (res.type === "REVIEW_SUMMARY_ERROR") {
                    return reject(
                        new Error(
                            res.message ||
                                "리뷰 요약 처리 중 오류가 발생했습니다",
                        ),
                    );
                }

                if (!res.data) {
                    return reject(new Error("응답 데이터가 없습니다"));
                }

                const {
                    totalCount,
                    averageRating,
                    positiveReviews,
                    negativeReviews,
                    keywords,
                } = res.data;

                // 응답 데이터 유효성 검사
                const isValidCount =
                    typeof totalCount === "number" && totalCount >= 0;
                const isValidRating =
                    typeof averageRating === "number" &&
                    averageRating >= 0 &&
                    averageRating <= 5;
                const isValidPositive =
                    Array.isArray(positiveReviews) &&
                    positiveReviews.length > 0 &&
                    positiveReviews.every(
                        (review) => typeof review === "string",
                    );
                const isValidNegative =
                    Array.isArray(negativeReviews) &&
                    negativeReviews.length > 0 &&
                    negativeReviews.every(
                        (review) => typeof review === "string",
                    );
                const isValidKeywords =
                    Array.isArray(keywords) &&
                    keywords.length > 0 &&
                    keywords.every((keyword) => typeof keyword === "string");

                if (
                    isValidCount &&
                    isValidRating &&
                    isValidPositive &&
                    isValidNegative &&
                    isValidKeywords
                ) {
                    resolve(res.data);
                } else {
                    console.error("리뷰 요약 데이터 형식 오류", {
                        totalCount,
                        averageRating,
                        positiveReviews,
                        negativeReviews,
                        keywords,
                    });
                    reject(
                        new Error("올바른 형식의 리뷰 요약 데이터가 아닙니다"),
                    );
                }
            },
        );
    });
};
