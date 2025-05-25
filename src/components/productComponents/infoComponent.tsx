import React, { useState } from "react";
import { sendOutlineInfoRequest } from "../../content/apiSetting/sendInfoRequest";

type OutlineCategory = "MAIN" | "USAGE" | "WARNING" | "SPECS" | "CERTIFICATION";

const OUTLINE_CATEGORIES = [
    { key: "MAIN", label: "주요 정보" },
    { key: "USAGE", label: "사용 방법 및 대상" },
    { key: "WARNING", label: "주의 및 보관" },
    { key: "SPECS", label: "규격 및 옵션" },
    { key: "CERTIFICATION", label: "인증 및 기타" },
] as const;

export const InfoComponent = () => {
    const [selected, setSelected] = useState<OutlineCategory | null>(null);
    const [info, setInfo] = useState<string>("");
    const [loading, setLoading] = useState(false);

    if (!window.location.href.includes("coupang.com/vp/products/")) return null;

    const commonTextStyle: React.CSSProperties = {
        fontFamily: "KoddiUD OnGothic",
        fontSize: "28px",
        fontStyle: "normal",
        fontWeight: 700,
        lineHeight: "150%",
        textAlign: "center",
    };

    const handleClick = async (outline: OutlineCategory) => {
        if (selected === outline) {
            setSelected(null);
            return;
        }

        setSelected(outline);
        setLoading(true);

        try {
            const vendorEl = document.querySelector(".vendor-item");
            if (!vendorEl) {
                console.warn("[voim] .vendor-item 요소가 없습니다.");
                setInfo("상품 정보를 불러올 수 없습니다.");
                return;
            }

            const rawHtml = vendorEl.outerHTML
                .replace(/\sonerror=\"[^\"]*\"/g, "")
                .replace(/\n/g, "")
                .trim();

            const result = await sendOutlineInfoRequest(outline, rawHtml);
            setInfo(result || "정보가 없습니다.");
        } catch (error) {
            console.error("[voim] INFO API 실패", error);
            setInfo("정보를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                padding: "24px",
                border: "4px solid #8914FF",
                borderRadius: "20px",
                backgroundColor: "#ffffff",
                fontFamily: "KoddiUDOnGothic",
                zIndex: 1,
            }}
        >
            <h2
                style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    marginBottom: "12px",
                    fontFamily: "KoddiUDOnGothic",
                }}
            >
                상세정보 요약
            </h2>
            <p
                style={{
                    color: "#121212",
                    marginBottom: "16px",
                    fontSize: "24px",
                    fontStyle: "normal",
                    fontWeight: 700,
                    fontFamily: "KoddiUDOnGothic",
                }}
            >
                해당 상품의 상세 정보에는 다음과 같은 정보가 담겨 있습니다. 버튼
                클릭 시, 아래에 클릭한 정보가 표시됩니다.
            </p>

            {OUTLINE_CATEGORIES.map(({ key, label }) => (
                <div
                    key={key}
                    style={{
                        width: "96%",
                        padding: "16px",
                        backgroundColor: "#FEFEFE",
                        marginBottom: "5px",
                        fontWeight: 700,
                        fontSize: "24px",
                        fontFamily: "KoddiUD OnGothic",
                        textAlign: "center",
                    }}
                >
                    {selected === key && (
                        <>
                            <div
                                style={{
                                    ...commonTextStyle,
                                    whiteSpace: "pre-wrap",
                                }}
                            >
                                {loading ? "불러오는 중..." : info}
                            </div>
                            <button
                                onClick={() => setSelected(null)}
                                style={{
                                    width: "100%",
                                    backgroundColor: "#8914FF",
                                    color: "white",
                                    fontSize: "18px",
                                    fontWeight: 700,
                                    border: "none",
                                    padding: "12px 0",
                                    borderRadius: "12px",
                                    marginBottom: "16px",
                                    cursor: "pointer",
                                    marginTop: "20px",
                                }}
                            >
                                닫기
                            </button>
                        </>
                    )}
                    <div
                        onClick={() => handleClick(key)}
                        style={{
                            width: "96%",
                            padding: "16px",
                            backgroundColor: "#FEFEFE",
                            borderRadius: "14px",
                            fontWeight: 700,
                            fontSize: "24px",
                            fontFamily: "KoddiUD OnGothic",
                            marginBottom: "12px",
                            cursor: "pointer",
                            textAlign: "center",
                            border: "4px solid #EAEDF4",
                        }}
                    >
                        {label}
                    </div>
                </div>
            ))}
        </div>
    );
};
