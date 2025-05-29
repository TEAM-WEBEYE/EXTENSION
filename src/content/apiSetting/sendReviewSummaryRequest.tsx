interface ReviewRating {
    totalCount: number;
    ratings: number[];
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

const extractTotalCount = (container: Element): number => {
    const text =
        container
            .querySelector(
                ".review-star-search-item-counts, .js_reviewArticleOptionStarAllCount",
            )
            ?.textContent?.trim() ?? "0";
    return parseInt(text.replace(/,/g, ""), 10);
};

const extractStarRatings = (container: Element): number[] => {
    const ratings = [0, 0, 0, 0, 0]; // [최고, 좋음, 보통, 별로, 나쁨]
    console.log("[voim] 별점 추출 시작");

    // 별점별 개수 수집
    const starItems = container.querySelectorAll(
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

        // data-rating 값에 따라 해당하는 인덱스에 개수 할당
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

    console.log("[voim] 최종 별점 배열:", ratings);
    return ratings;
};

export const collectCoupangReviewData =
    async (): Promise<ReviewSummaryRequestPayload | null> => {
        console.log("[voim] collectCoupangReviewData 시작");
        try {
            const selectors = [
                ".review-star-search-selector",
                ".sdp-review__article__order__star__option",
            ];
            let container: Element | null = null;

            console.log("[voim] 별점 컨테이너 찾기 시작");
            for (const selector of selectors) {
                console.log(`[voim] 선택자 시도: ${selector}`);
                container = await waitForElement(selector);
                if (container) {
                    console.log(`[voim] 컨테이너 찾음: ${selector}`);
                    break;
                }
            }

            if (!container) {
                console.error("[voim] 별점 컨테이너를 찾을 수 없습니다.");
                return null;
            }

            console.log("[voim] 별점 데이터 추출 시작");
            const totalCount = extractTotalCount(container);
            console.log("[voim] 총 리뷰 수:", totalCount);

            const ratings = extractStarRatings(container);
            console.log("[voim] 추출된 별점:", ratings);

            // 리뷰 텍스트 추출
            console.log("[voim] 리뷰 텍스트 추출 시작");
            const reviewElements = document.querySelectorAll(
                ".sdp-review__article__list__review__content",
            );
            console.log("[voim] 찾은 리뷰 수:", reviewElements.length);

            const reviews = Array.from(reviewElements).map((element) => {
                const text = element.textContent || "";
                return text.replace(/<br>/g, "\n").trim();
            });

            const productIdMatch =
                window.location.href.match(/\/products\/(\d+)/);
            const productId = productIdMatch?.[1] ?? "";
            console.log("[voim] 추출된 상품 ID:", productId);

            if (!productId) {
                console.error("[voim] productId를 찾을 수 없습니다.");
                return null;
            }

            const result = {
                productId,
                reviewRating: { totalCount, ratings },
                reviews,
            };
            console.log("[voim] 최종 수집 데이터:", result);

            return result;
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
            { type: "FETCH_REVIEW_SUMMARY", payload },
            (response: unknown) => {
                if (!response || typeof response !== "object") {
                    return reject(new Error("Invalid response format"));
                }

                const res = response as ReviewSummaryAPIResponse;

                if (res.type === "REVIEW_SUMMARY_ERROR") {
                    return reject(
                        new Error(
                            res.message ??
                                "리뷰 요약 처리 중 오류가 발생했습니다",
                        ),
                    );
                }

                const {
                    totalCount,
                    averageRating,
                    positiveReviews,
                    negativeReviews,
                    keywords,
                } = res.data;

                const valid =
                    typeof totalCount === "number" &&
                    typeof averageRating === "number" &&
                    Array.isArray(positiveReviews) &&
                    Array.isArray(negativeReviews) &&
                    Array.isArray(keywords) &&
                    positiveReviews.every((r) => typeof r === "string") &&
                    negativeReviews.every((r) => typeof r === "string") &&
                    keywords.every((k) => typeof k === "string");

                if (!valid) {
                    console.error("리뷰 요약 데이터 형식 오류", res.data);
                    return reject(
                        new Error("올바른 형식의 리뷰 요약 데이터가 아닙니다"),
                    );
                }

                resolve(res.data);
            },
        );
    });
};
