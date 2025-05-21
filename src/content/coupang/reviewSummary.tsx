import React from "react";
import { createRoot } from "react-dom/client";
import { ThemeContextProvider, useTheme } from "@src/contexts/ThemeContext";

interface ReviewSummaryProps {
    result: {
        data: {
            averageRating: number;
            keywords: string[];
            positiveReviews: string[];
            negativeReviews: string[];
        };
    };
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
    };

    const subTitleStyle = {
        fontSize: fontClasses.fontCommon,
        color: "#8914FF",
    };

    const contentStyle = {
        fontSize: fontClasses.fontCaption,
        whiteSpace: "pre-wrap" as const,
        marginTop: "16px",
    };

    const valueStyle = {
        backgroundColor: "#F5F5F5",
        padding: "18px 24px",
        borderRadius: "14px",
    };

    const itemStyle = {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    };

    const dividerStyle = {
        height: "2px",
        width: "100%",
        backgroundColor: "#E0E0E0",
        margin: "15px 0",
    };

    const reviewMap = new Map<string, string[]>([
        ["주요 리뷰 키워드", result.data.keywords],
        ["긍정적 리뷰", result.data.positiveReviews],
        ["부정적 리뷰", result.data.negativeReviews],
    ]);

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <div style={titleStyle}>리뷰 요약</div>
            </div>
            <div style={subTitleStyle}>
                전체 리뷰는{" "}
                {result.data.keywords.length +
                    result.data.positiveReviews.length +
                    result.data.negativeReviews.length}
                개이며, 전체 평점은 {result.data.averageRating}입니다.
            </div>
            <div style={contentStyle}>
                {Array.from(reviewMap).map(([key, value]) => (
                    <div key={key} style={{ marginBottom: "12px" }}>
                        <strong>{key}:</strong>
                        <div style={valueStyle}>
                            {value.map((item: string, idx: number) => (
                                <div key={idx}>
                                    <div style={itemStyle}>{item}</div>
                                    {idx !== value.length - 1 && (
                                        <div style={dividerStyle} />
                                    )}
                                </div>
                            ))}
                        </div>
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
