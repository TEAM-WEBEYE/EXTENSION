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
    // 모든 별점 보기 항목에서 총 개수 추출
    const totalCountElement = container.querySelector(
        ".review-star-search-item:first-child .review-star-search-item-counts",
    );
    const text = totalCountElement?.textContent?.trim() ?? "0";
    return parseInt(text.replace(/,/g, ""), 10);
};

const extractStarRatings = (container: Element): number[] => {
    const ratings = [0, 0, 0, 0, 0]; // [최고, 좋음, 보통, 별로, 나쁨]

    // 새로운 구조에서 별점별 개수 수집
    const starItems = container.querySelectorAll(".review-star-search-item");

    starItems.forEach((item) => {
        const descElement = item.querySelector(".review-star-search-item-desc");
        const countElement = item.querySelector(
            ".review-star-search-item-counts",
        );
        const desc = descElement?.textContent?.trim() || "";
        const count = parseInt(
            countElement?.textContent?.replace(/,/g, "") || "0",
            10,
        );

        // 설명 텍스트에 따라 해당하는 인덱스에 개수 할당
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
    });

    return ratings;
};

export const collectCoupangReviewData =
    async (): Promise<ReviewSummaryRequestPayload | null> => {
        try {
            const selectors = [
                ".review-star-search-selector",
                ".sdp-review__article__order__star__option",
            ];
            let container: Element | null = null;

            for (const selector of selectors) {
                container = await waitForElement(selector);
                if (container) {
                    break;
                }
            }

            if (!container) {
                console.error("[voim] 별점 컨테이너를 찾을 수 없습니다.");
                return null;
            }

            const totalCount = extractTotalCount(container);

            const ratings = extractStarRatings(container);

            const reviewElements = document.querySelectorAll(
                ".sdp-review__article__list__review__content, .review-content",
            );

            const reviews = Array.from(reviewElements).map((element) => {
                const text = element.textContent || "";
                return text.replace(/<br>/g, "\n").trim();
            });

            const productIdMatch =
                window.location.href.match(/\/products\/(\d+)/);
            const productId = productIdMatch?.[1] ?? "";

            if (!productId) {
                console.error("[voim] productId를 찾을 수 없습니다.");
                return null;
            }

            const result = {
                productId,
                reviewRating: { totalCount, ratings },
                reviews,
            };

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
        if (chrome.runtime.lastError) {
            console.error("[voim] 런타임 오류:", chrome.runtime.lastError);
            return reject(new Error(chrome.runtime.lastError.message));
        }

        chrome.runtime.sendMessage(
            { type: "FETCH_REVIEW_SUMMARY", payload },
            (response: unknown) => {
                if (chrome.runtime.lastError) {
                    console.error(
                        "[voim] 메시지 응답 오류:",
                        chrome.runtime.lastError,
                    );
                    return reject(new Error(chrome.runtime.lastError.message));
                }

                if (!response || typeof response !== "object") {
                    console.error("[voim] 잘못된 응답 형식:", response);
                    return reject(new Error("Invalid response format"));
                }

                const res = response as ReviewSummaryAPIResponse;

                if (res.type === "REVIEW_SUMMARY_ERROR") {
                    console.error("[voim] 리뷰 요약 처리 오류:", res.message);
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
                    console.error(
                        "[voim] 리뷰 요약 데이터 형식 오류:",
                        res.data,
                    );
                    return reject(
                        new Error("올바른 형식의 리뷰 요약 데이터가 아닙니다"),
                    );
                }

                resolve(res.data);
            },
        );
    });
};
