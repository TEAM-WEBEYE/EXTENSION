import React, { useEffect, useState } from "react";

export const HealthComponent = () => {
    const [healthEffects, setHealthEffects] = useState<string[] | null>(null);
    const [showAll, setShowAll] = useState(false);

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
            const productId =
                window.location.href.match(/products\/(\d+)/)?.[1];
            if (!productId) return;

            const { birthYear, gender } = await chrome.storage.local.get([
                "birthYear",
                "gender",
            ]);

            const rawHtml = targetEl.outerHTML
                .replace(/\sonerror=\"[^\"]*\"/g, "")
                .replace(/\n/g, "")
                .trim();

            chrome.runtime.sendMessage(
                {
                    type: "FETCH_HEALTH_DATA",
                    payload: {
                        productId,
                        title: document.title,
                        html: rawHtml,
                        birthYear: Number(birthYear),
                        gender: gender?.toUpperCase() || "UNKNOWN",
                        allergies: [],
                    },
                },
                (res) => {
                    const data = res?.data?.types || [];
                    setHealthEffects(data);
                },
            );
        };

        const targetEl =
            document.querySelector(".vendor-item") ||
            document.querySelector(".product-detail-content") ||
            document.querySelector(".prod-image");

        if (targetEl) {
            fetchData(targetEl);
        } else {
            const observer = new MutationObserver(() => {
                const el =
                    document.querySelector(".vendor-item") ||
                    document.querySelector(".product-detail-content") ||
                    document.querySelector(".prod-image");
                if (el) {
                    observer.disconnect();
                    fetchData(el);
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
            return () => observer.disconnect();
        }
    }, []);

    if (!healthEffects) {
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
                제품 효능을 분석 중입니다...
            </div>
        );
    }

    const visibleItems = showAll ? healthEffects : healthEffects.slice(0, 3);

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
            <p style={commonTextStyle}>[건강기능식품] 제품 효능</p>
            <p
                style={{
                    marginTop: "12px",
                    fontFamily: "KoddiUD OnGothic",
                    fontSize: "24px",
                    fontStyle: "normal",
                    fontWeight: 700,
                    lineHeight: "150%",
                    textAlign: "left",
                }}
            >
                아래의 {healthEffects.length}가지 기능성 효능을 가진 제품입니다.
                <br />
                섭취 시 참고해주세요.
            </p>

            <div
                style={{
                    backgroundColor: "#F5F7FB",
                    borderRadius: "12px",
                    padding: "16px",
                    margin: "16px 0",
                }}
            >
                {visibleItems.map((item, idx) => (
                    <div
                        key={idx}
                        style={{
                            fontWeight: 700,
                            fontSize: "24px",
                            marginBottom:
                                idx < visibleItems.length - 1 ? "12px" : "0",
                        }}
                    >
                        {item}
                    </div>
                ))}
            </div>
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
                    cursor: "pointer",
                }}
                onClick={() => setShowAll(!showAll)}
            >
                {showAll ? "전체 보기 닫기" : "전체 보기"}
            </button>
        </div>
    );
};
