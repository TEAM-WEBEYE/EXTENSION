import React from "react";
import { createRoot } from "react-dom/client";
import { ThemeContextProvider, useTheme } from "@src/contexts/ThemeContext";

interface ReviewSummaryProps {
    result: any;
}

const ReviewSummaryComponent = ({ result }: ReviewSummaryProps) => {
    const { fontClasses } = useTheme();

    const containerStyle = {
        borderRadius: "20px",
        border: "4px solid #8914FF",
        fontFamily: "KoddiUDOnGothic",
        width: "100%",
        padding: "28px",
        backgroundColor: "#FFFFFF",
        color: "#212121",
        marginTop: "20px",
    };

    const headerStyle = {
        display: "flex",
        flexDirection: "column" as const,
        gap: "16px",
        marginBottom: "26px",
    };

    const titleStyle = {
        fontSize: fontClasses.fontHeading,
        color: "#8914FF",
    };

    const contentStyle = {
        fontSize: fontClasses.fontCommon,
        whiteSpace: "pre-wrap" as const,
        marginTop: "16px",
    };

    const reviewMap = new Map([
        ["주요 리뷰 키워드", result.data.keywords],
        ["긍정적 리뷰", result.data.positiveReviews],
        ["부정적 리뷰", result.data.negativeReviews],
    ]);

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <div style={titleStyle}>리뷰 요약</div>
            </div>
            <div>
                전체 리뷰는 개이며, 전체 평점은 {result.data.averageRating}
                입니다.
            </div>
            <div style={contentStyle}>
                {Array.from(reviewMap).map(([key, value]) => (
                    <div key={key} style={{ marginBottom: "12px" }}>
                        <strong style={{ color: "#8914FF" }}>{key}:</strong>{" "}
                        {value}
                    </div>
                ))}
            </div>
        </div>
    );
};

export const MountReviewSummaryApp = (result: any) => {
    const container = document.createElement("div");
    container.id = "webeye-review-summary";

    const targetDiv = document.querySelector(
        ".prod-atf.twc-block.md\\:twc-flex.twc-relative",
    );
    if (targetDiv && !document.getElementById("webeye-review-summary")) {
        targetDiv.insertAdjacentElement("afterend", container);
        console.log(result);
        const root = createRoot(container);
        root.render(
            <ThemeContextProvider>
                <ReviewSummaryComponent result={result} />
            </ThemeContextProvider>,
        );
    }
};
