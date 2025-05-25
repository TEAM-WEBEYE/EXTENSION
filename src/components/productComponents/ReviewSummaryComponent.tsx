import { useTheme } from "@src/contexts/ThemeContext";
import React from "react";

interface ReviewSummary {
    totalCount: number;
    averageRating: number;
    positiveReviews: string[];
    negativeReviews: string[];
    keywords: string[];
}

interface ReviewSummaryComponentProps {
    summary: ReviewSummary;
}

export const ReviewSummaryComponent = ({
    summary,
}: ReviewSummaryComponentProps) => {
    const { fontClasses } = useTheme();

    const containerStyle: React.CSSProperties = {
        padding: "24px",
        border: "4px solid #8914FF",
        borderRadius: "20px",
        backgroundColor: "#ffffff",
        fontFamily: "KoddiUDOnGothic",
        zIndex: 1,
        boxSizing: "border-box", // Include padding and border in the element's total width and height
    };

    const titleStyle: React.CSSProperties = {
        fontSize: "24px",
        fontWeight: 700,
        marginBottom: "16px",
        fontFamily: "KoddiUDOnGothic",
        color: "#121212",
    };

    const summaryTextStyle: React.CSSProperties = {
        fontSize: "18px",
        fontWeight: 400,
        marginBottom: "24px",
        fontFamily: "KoddiUDOnGothic",
        color: "#8914FF",
    };

    const sectionTitleStyle: React.CSSProperties = {
        fontSize: "20px",
        fontWeight: 700,
        marginBottom: "12px",
        fontFamily: "KoddiUDOnGothic",
        color: "#121212",
    };

    const listItemStyle: React.CSSProperties = {
        padding: "12px",
        marginBottom: "8px",
        borderRadius: "8px",
        fontSize: "16px",
        fontFamily: "KoddiUDOnGothic",
        color: "#121212",
    };

    const dividerStyle: React.CSSProperties = {
        height: "2px",
        width: "100%",
        backgroundColor: "#E0E0E0",
        margin: "15px 0",
    };

    const sectionContainerStyle: React.CSSProperties = {
        marginBottom: "42px",
        backgroundColor: "#F5F5F5",
        padding: "18px 24px",
        borderRadius: "14px",
        fontSize: fontClasses.fontCommon,
    };

    return (
        <div style={containerStyle}>
            <h2 style={titleStyle}>리뷰 요약</h2>
            <p style={summaryTextStyle}>
                전체 리뷰는 {summary.totalCount}개이며, 전체 평점은{" "}
                {summary.averageRating.toFixed(2)}입니다.
            </p>
            <div>
                <h3 style={sectionTitleStyle}>주요 리뷰 키워드</h3>
                <div style={sectionContainerStyle}>
                    <ul>
                        {summary.keywords.map((keyword, index) => (
                            <React.Fragment key={index}>
                                <li style={listItemStyle}>{keyword}</li>
                                {index !== summary.keywords.length - 1 && (
                                    <div style={dividerStyle} />
                                )}
                            </React.Fragment>
                        ))}
                    </ul>
                </div>
            </div>
            <div>
                <h3 style={sectionTitleStyle}>긍정적 리뷰</h3>
                <div style={sectionContainerStyle}>
                    <ul>
                        {summary.positiveReviews.map((review, index) => (
                            <React.Fragment key={index}>
                                <li style={listItemStyle}>{review}</li>
                                {index !==
                                    summary.positiveReviews.length - 1 && (
                                    <div style={dividerStyle} />
                                )}
                            </React.Fragment>
                        ))}
                    </ul>
                </div>
            </div>
            <div>
                <h3 style={sectionTitleStyle}>부정적 리뷰</h3>
                <div style={sectionContainerStyle}>
                    <ul>
                        {summary.negativeReviews.map((review, index) => (
                            <React.Fragment key={index}>
                                <li style={listItemStyle}>{review}</li>
                                {index !==
                                    summary.negativeReviews.length - 1 && (
                                    <div style={dividerStyle} />
                                )}
                            </React.Fragment>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};
