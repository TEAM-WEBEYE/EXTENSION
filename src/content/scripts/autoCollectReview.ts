import {
    collectCoupangReviewData,
    sendReviewSummaryRequest,
} from "../apiSetting/sendReviewSummaryRequest";
import React from "react";
import { createRoot } from "react-dom/client";
import { ReviewSummaryComponent } from "../../components/productComponents/ReviewSummaryComponent";
import { ThemeContextProvider } from "../../contexts/ThemeContext";

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

const renderReviewSummary = (summary: ReviewSummary | undefined) => {
    if (!summary) {
        console.error("[voim] 리뷰 요약 데이터가 없습니다.");
        return;
    }

    const waitForInfoComponent = (callback: () => void, retries = 20) => {
        const infoComponent = document.getElementById("voim-info-component");
        if (infoComponent) {
            console.log(
                "[voim] voim-info-component 찾음. 리뷰 요약 컴포넌트 렌더링 시작.",
            );
            callback();
        } else if (retries > 0) {
            console.log(
                `[voim] voim-info-component 대기 중... 남은 시도 횟수: ${retries}`,
            );
            setTimeout(() => waitForInfoComponent(callback, retries - 1), 500);
        } else {
            console.error(
                "[voim] voim-info-component를 찾을 수 없습니다. 리뷰 요약 컴포넌트 렌더링 실패.",
            );
        }
    };

    const insertReviewSummary = () => {
        const infoComponent = document.getElementById("voim-info-component");
        if (infoComponent && infoComponent.parentNode) {
            const container = document.createElement("div");
            container.id = "voim-review-summary";
            container.style.position = "relative";
            container.style.marginTop = "20px";
            container.style.marginBottom = "20px";
            container.style.zIndex = "9999";

            // voim-info-component 바로 뒤에 삽입
            infoComponent.parentNode.insertBefore(
                container,
                infoComponent.nextSibling,
            );

            const root = createRoot(container);
            root.render(
                React.createElement(
                    ThemeContextProvider,
                    null,
                    React.createElement(ReviewSummaryComponent, { summary }),
                ),
            );
            console.log("[voim] 리뷰 요약 컴포넌트 렌더링 완료");
        } else {
            console.error(
                "[voim] voim-info-component를 찾을 수 없어 리뷰 요약 컴포넌트를 삽입할 수 없습니다.",
            );
        }
    };

    // voim-info-component가 로드될 때까지 기다린 후 삽입
    waitForInfoComponent(insertReviewSummary);
};

// 특정 요소가 DOM에 나타날 때까지 기다리는 헬퍼 함수
const waitForElement = (
    selector: string,
    timeout = 10000,
    interval = 500,
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
                    `[voim] 요소 ${selector}를 ${timeout / 1000}초 안에 찾지 못했습니다.`,
                );
                resolve(null);
            }
        }, interval);
    });
};

const initAutoCollectReview = async () => {
    if (!isProductDetailPage()) return;

    try {
        console.log("[voim] 리뷰 데이터 자동 수집 시작...");

        // 별점 컨테이너가 로드될 때까지 대기
        const starContainer = await waitForElement(
            ".sdp-review__article__order__star__list, .sdp-review__article__order__star__all",
        );
        if (!starContainer) {
            console.error("[voim] 별점 컨테이너 로드 실패");
            return;
        }
        console.log("[voim] 별점 컨테이너 로드 완료");

        // 리뷰 섹션이 로드될 때까지 대기
        const reviewSections = await waitForElement(
            ".sdp-review__average__summary__section",
        );
        if (!reviewSections) {
            console.error("[voim] 리뷰 섹션 로드 실패");
            return;
        }
        console.log("[voim] 리뷰 섹션 로드 완료");

        // 페이지가 완전히 로드될 때까지 대기 (기존 로직 유지)
        // await new Promise((resolve) => setTimeout(resolve, 2000));

        const reviewData = collectCoupangReviewData();
        if (!reviewData) {
            console.error("[voim] 리뷰 데이터 수집 실패");
            return;
        }

        console.log("[voim] 수집된 리뷰 데이터:", reviewData);

        const summary = await sendReviewSummaryRequest(reviewData);
        console.log("[voim] 리뷰 요약 결과:", summary);

        // 결과를 스토리지에 저장
        chrome.storage.local.set(
            {
                [`review_summary_${reviewData.productId}`]: summary,
            },
            () => {
                console.log("[voim] 리뷰 요약 데이터 저장 완료");
                // 컴포넌트 렌더링 (voim-info-component 로드 대기 포함)
                renderReviewSummary(summary);
            },
        );
    } catch (error) {
        console.error("[voim] 리뷰 데이터 자동 수집 중 오류:", error);
    }
};

// 페이지 로드 시 실행
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAutoCollectReview);
} else {
    initAutoCollectReview();
}
