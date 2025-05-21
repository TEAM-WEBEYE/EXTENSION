export function parseReviewSections() {
    const sections = document.querySelectorAll(
        ".review-summary-survey-section",
    );
    const reviews: Record<string, Record<string, number>> = {};

    sections.forEach((section) => {
        const question = section.querySelector("h4")?.textContent?.trim();
        const answers = section.querySelectorAll(
            ".review-summary-survey-answer-title",
        );
        const percentages = section.querySelectorAll(
            ".review-summary-survey-answer-percentage",
        );

        if (!question) return;

        const parsed: Record<string, number> = {};
        answers.forEach((el, idx) => {
            const label =
                el.getAttribute("title") || el.textContent?.trim() || "";
            const percentText =
                percentages[idx]?.textContent?.replace("%", "") ?? "0";
            parsed[label] = parseInt(percentText, 10);
        });

        reviews[question] = parsed;
    });

    return reviews;
}

export function parseReviewRating() {
    const popup = document.querySelector(
        ".review-average-detail-popup-container",
    );
    if (!popup) {
        console.warn("별점 상세 팝업이 열려 있지 않습니다.");
        return null;
    }

    const totalCountText = popup
        .querySelector(
            ".review-average-detail-popup-content-header > span:last-child",
        )
        ?.textContent?.trim();
    const totalCount = totalCountText
        ? parseInt(totalCountText.replace(/\D/g, ""), 10)
        : 0;

    const items = popup.querySelectorAll(".review-average-detail-popup-item");
    const ratings: Record<string, number> = {};

    items.forEach((item) => {
        const label = item
            .querySelector("div:nth-child(1)")
            ?.textContent?.trim();
        const percentText = item
            .querySelector("div:nth-child(3)")
            ?.textContent?.trim()
            .replace("%", "");
        if (label && percentText) {
            ratings[label] = parseInt(percentText, 10);
        }
    });

    return {
        totalCount,
        ratings,
    };
}
