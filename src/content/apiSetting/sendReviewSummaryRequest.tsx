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
    reviews: ReviewCategory;
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

export const collectCoupangReviewData =
    (): ReviewSummaryRequestPayload | null => {
        try {
            // 별점 데이터 수집
            const starRatingContainer = document.querySelector(
                ".sdp-review__article__order__star__list",
            );
            if (!starRatingContainer) {
                console.error("[voim] 별점 컨테이너를 찾을 수 없습니다.");
                return null;
            }

            const totalCountText =
                document
                    .querySelector(".js_reviewArticleCurrentStarAllCount")
                    ?.textContent?.trim() || "0";
            const totalCount = parseInt(totalCountText.replace(/,/g, ""));

            type RatingKey = "최고" | "좋음" | "보통" | "별로" | "나쁨";
            const ratingsMap: Record<RatingKey, number> = {
                최고: 0,
                좋음: 0,
                보통: 0,
                별로: 0,
                나쁨: 0,
            };

            // 별점별 개수 수집
            const starItems = starRatingContainer.querySelectorAll(
                ".js_reviewArticleStarSelectOption",
            );
            starItems.forEach((item) => {
                const ratingText = item
                    .querySelector(
                        ".sdp-review__article__order__star__list__item__content",
                    )
                    ?.textContent?.trim();
                const countText =
                    item
                        .querySelector(
                            '[class*="js_reviewArticleOptionStarCount"]',
                        )
                        ?.textContent?.trim() || "0";

                if (ratingText && ratingText in ratingsMap) {
                    ratingsMap[ratingText as RatingKey] = parseInt(
                        countText.replace(/,/g, ""),
                    );
                }
            });

            // 배열 형태로 변환 (최고 -> 나쁨 순서)
            const ratingsArray: number[] = [
                ratingsMap.최고,
                ratingsMap.좋음,
                ratingsMap.보통,
                ratingsMap.별로,
                ratingsMap.나쁨,
            ];

            // 리뷰 섹션 데이터 수집
            const reviewSections = document.querySelectorAll(
                ".sdp-review__average__summary__section",
            );
            if (!reviewSections.length) {
                console.error("[voim] 리뷰 섹션을 찾을 수 없습니다.");
                return null;
            }

            const reviews: ReviewCategory = {};

            reviewSections.forEach((section) => {
                const categoryTitle = section
                    .querySelector(
                        ".sdp-review__average__summary__section__title",
                    )
                    ?.textContent?.trim();
                if (!categoryTitle) return;

                const categoryRatings: { [key: string]: number } = {};
                const items = section.querySelectorAll(
                    ".sdp-review__average__summary__section__list__item",
                );

                items.forEach((item) => {
                    const answer = item
                        .querySelector(
                            ".sdp-review__average__summary__section__list__item__answer",
                        )
                        ?.textContent?.trim();
                    const percentText = item
                        .querySelector(
                            ".sdp-review__average__summary__section__list__item__graph__percent",
                        )
                        ?.textContent?.trim();

                    if (answer && percentText) {
                        const percent = parseInt(percentText.replace("%", ""));
                        if (!isNaN(percent)) {
                            categoryRatings[answer] = percent;
                        }
                    }
                });

                if (Object.keys(categoryRatings).length > 0) {
                    reviews[categoryTitle] = categoryRatings;
                }
            });

            // productId 추출 (URL에서)
            const url = window.location.href;
            const productIdMatch = url.match(/\/products\/(\d+)/);
            const productId = productIdMatch ? productIdMatch[1] : "";

            if (!productId) {
                console.error("[voim] productId를 찾을 수 없습니다.");
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
                console.log("[voim] 리뷰 요약 응답:", response);

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
