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
    console.log("[voim] 별점 추출 시작");

    // 새로운 구조에서 별점별 개수 수집
    const starItems = container.querySelectorAll(".review-star-search-item");
    console.log("[voim] 찾은 별점 항목 수:", starItems.length);

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

        console.log("[voim] 별점 항목 처리:", {
            desc,
            countText: countElement?.textContent,
            parsedCount: count,
        });

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
                console.log(
                    "[voim] 현재 페이지 HTML:",
                    document.body.innerHTML,
                );
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
                ".sdp-review__article__list__review__content, .review-content",
            );
            console.log("[voim] 찾은 리뷰 수:", reviewElements.length);

            const reviews = Array.from(reviewElements).map((element) => {
                const text = element.textContent || "";
                return text.replace(/<br>/g, "\n").trim();
            });

            console.log("[voim] 추출된 리뷰:", reviews);

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
            console.log("[voim] 현재 페이지 URL:", window.location.href);
            return null;
        }
    };

export const sendReviewSummaryRequest = (
    payload: ReviewSummaryRequestPayload,
): Promise<ReviewSummaryData> => {
    console.log("[voim] 리뷰 요약 요청 시작:", payload);
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

                console.log("[voim] 리뷰 요약 응답:", response);

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

                console.log("[voim] 리뷰 요약 데이터:", {
                    totalCount,
                    averageRating,
                    positiveReviews,
                    negativeReviews,
                    keywords,
                });

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

                console.log("[voim] 리뷰 요약 처리 완료");
                resolve(res.data);
            },
        );
    });
};
