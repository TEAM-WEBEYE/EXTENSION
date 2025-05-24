import React, { useEffect, useState } from "react";

export const CosmeticComponent = () => {
    const [dangerIngredients, setDangerIngredients] = useState<string[]>([]);
    const [allergyIngredients, setAllergyIngredients] = useState<string[]>([]);
    const [dangerOpen, setDangerOpen] = useState(true);
    const [allergyOpen, setAllergyOpen] = useState(false);

    const commonTextStyle: React.CSSProperties = {
        fontFamily: "KoddiUD OnGothic",
        fontSize: "28px",
        fontStyle: "normal",
        fontWeight: 700,
        lineHeight: "150%",
        textAlign: "left",
    };

    useEffect(() => {
        const fetchData = async (targetEl: Element) => {
            try {
                const productId =
                    window.location.href.match(/products\/(\d+)/)?.[1];
                if (!productId) {
                    console.warn("[voim] productId 없음");
                    return;
                }

                const rawHtml = targetEl.outerHTML
                    .replace(/\sonerror=\"[^\"]*\"/g, "")
                    .replace(/\n/g, "")
                    .trim();

                if (!rawHtml.includes("<img")) {
                    console.warn("[voim]전송할 HTML에 <img> 태그 없음");
                }

                console.log("[voim] 전송할 HTML:", rawHtml);

                chrome.runtime.sendMessage(
                    {
                        type: "FETCH_COSMETIC_DATA",
                        payload: {
                            productId,
                            html: rawHtml,
                        },
                    },
                    (res) => {
                        const data = res?.data || {};
                        const dangerList = Object.entries(data)
                            .filter(([_, v]) => v === true)
                            .map(([k]) => k);

                        setDangerIngredients(dangerList.slice(0, 20));
                        setAllergyIngredients(dangerList.slice(20));
                    },
                );
            } catch (e) {
                console.error("[voim] COSMETIC API 실패:", e);
            }
        };

        const candidateEl =
            document.querySelector(".vendor-item") ||
            document.querySelector(".product-detail-content") ||
            document.querySelector(".prod-image");

        if (candidateEl) {
            console.log("[voim] DOM 즉시 발견됨");
            fetchData(candidateEl);
            return;
        }

        const observer = new MutationObserver(() => {
            const target =
                document.querySelector(".vendor-item") ||
                document.querySelector(".product-detail-content") ||
                document.querySelector(".prod-image");

            if (target) {
                console.log("[voim]DOM 등장 감지됨 (observer)");
                observer.disconnect();
                fetchData(target);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => observer.disconnect();
    }, []);

    if (dangerIngredients === null || allergyIngredients === null) {
        return (
            <div
                style={{
                    padding: "16px",
                    borderRadius: "20px",
                    width: "618px",
                    border: "4px solid #8914FF",
                    backgroundColor: "#ffffff",
                    position: "absolute",
                    top: "610px",
                    right: "490px",
                    zIndex: 9999,
                    fontFamily: "KoddiUDOnGothic",
                    textAlign: "center",
                    fontSize: "20px",
                    fontWeight: "bold",
                }}
            >
                화장품 성분을 분석 중입니다...
            </div>
        );
    }

    return (
        <div
            style={{
                padding: "16px",
                borderRadius: "20px",
                width: "618px",
                border: "4px solid #8914FF",
                backgroundColor: "#ffffff",
                position: "absolute",
                top: "610px",
                right: "490px",
                zIndex: 9999,
                fontFamily: "KoddiUDOnGothic",
            }}
        >
            <p style={commonTextStyle}>[화장품] 성분 안내</p>

            <div style={{ borderTop: "1px solid #EAEDF4", margin: "16px 0" }} />

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                    ...commonTextStyle,
                }}
            >
                <span>20가지 주의 성분</span>
                <span>총 {dangerIngredients.length}개</span>
            </div>

            {dangerOpen && (
                <div
                    style={{
                        backgroundColor: "#F5F7FB",
                        borderRadius: "12px",
                        padding: "16px",
                        marginBottom: "16px",
                    }}
                >
                    {dangerIngredients.map((item, idx) => (
                        <div
                            key={idx}
                            style={{
                                fontWeight: 700,
                                fontSize: "24px",
                                marginBottom:
                                    idx < dangerIngredients.length - 1
                                        ? "12px"
                                        : "0",
                            }}
                        >
                            {item}
                        </div>
                    ))}
                </div>
            )}

            <button
                style={{
                    width: "100%",
                    padding: "12px 0",
                    backgroundColor: "#8914FF",
                    color: "white",
                    borderRadius: "12px",
                    fontWeight: "bold",
                    fontSize: "16px",
                    border: "none",
                    marginBottom: "20px",
                    cursor: "pointer",
                }}
                onClick={() => setDangerOpen(!dangerOpen)}
            >
                {dangerOpen ? "전체 보기 닫기" : "전체 보기"}
            </button>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                    ...commonTextStyle,
                }}
            >
                <span>알레르기 유발 성분</span>
                <span>총 {allergyIngredients.length}개</span>
            </div>

            {allergyOpen && (
                <div
                    style={{
                        backgroundColor: "#F5F7FB",
                        borderRadius: "12px",
                        padding: "16px",
                        marginTop: "12px",
                    }}
                >
                    {allergyIngredients.map((item, idx) => (
                        <div
                            key={idx}
                            style={{
                                fontWeight: 600,
                                marginBottom:
                                    idx < allergyIngredients.length - 1
                                        ? "12px"
                                        : "0",
                            }}
                        >
                            {item}
                        </div>
                    ))}
                </div>
            )}

            <button
                style={{
                    width: "100%",
                    padding: "12px 0",
                    backgroundColor: "#D9BFFF",
                    color: "white",
                    borderRadius: "12px",
                    fontWeight: "bold",
                    fontSize: "16px",
                    border: "none",
                    cursor: "pointer",
                }}
                onClick={() => setAllergyOpen(!allergyOpen)}
            >
                {allergyOpen
                    ? "전체 보기 닫기"
                    : "알레르기 유발 성분 전체 보기"}
            </button>
        </div>
    );
};
