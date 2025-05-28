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
            console.log("[health api] fetchData 시작");
            const productId =
                window.location.href.match(/products\/(\d+)/)?.[1];
            console.log("[health api] productId:", productId);
            if (!productId) {
                console.log("[health api] productId를 찾을 수 없음");
                return;
            }

            const { birthYear, gender, Allergies } =
                await chrome.storage.local.get([
                    "birthYear",
                    "gender",
                    "Allergies",
                ]);
            console.log("[health api] 사용자 정보:", {
                birthYear,
                gender,
                Allergies,
            });

            const rawHtml = targetEl.outerHTML
                .replace(/\sonerror=\"[^\"]*\"/g, "")
                .replace(/\n/g, "")
                .trim();
            console.log("[health api] HTML 추출 완료");

            console.log("[health api] 메시지 전송 시작");
            chrome.runtime.sendMessage(
                {
                    type: "FETCH_HEALTH_DATA",
                    payload: {
                        productId,
                        title: document.title,
                        html: rawHtml,
                        birthYear: Number(birthYear),
                        gender: gender?.toUpperCase() || "UNKNOWN",
                        allergies: Allergies || [],
                    },
                },
                (res) => {
                    const data = res?.data?.types || [];
                    console.log("API 응답 데이터:", data);
                    setHealthEffects(data);
                    console.log("[health api] 응답 수신:", res);
                    if (res?.data?.types) {
                        console.log(
                            "[health api] 효능 데이터:",
                            res.data.types,
                        );
                        setHealthEffects(res.data.types);
                    } else {
                        console.log("[health api] 효능 데이터 없음");
                    }
                },
            );
        };

        const targetEl =
            document.querySelector(".vendor-item") ||
            document.querySelector(".product-detail-content") ||
            document.querySelector(".prod-image");
        console.log("[health api] targetEl 찾음:", targetEl);

        if (targetEl) {
            console.log(" 타겟 요소 찾음:", targetEl);
            fetchData(targetEl);
        } else {
            console.log("타겟 요소가 없어 MutationObserver 설정 중...");
            console.log("[health api] MutationObserver 시작");
            const observer = new MutationObserver(() => {
                const el =
                    document.querySelector(".vendor-item") ||
                    document.querySelector(".product-detail-content") ||
                    document.querySelector(".prod-image");
                if (el) {
                    console.log("MutationObserver가 타겟 요소 탐지:", el);
                    console.log("[health api] targetEl 발견, observer 중지");
                    observer.disconnect();
                    fetchData(el);
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
            return () => observer.disconnect();
        }
    }, []);

    if (!healthEffects) {
        console.log(" healthEffects 데이터가 아직 없습니다");
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
                    right: "280px",
                    zIndex: 1,
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
    console.log("👓 보여질 효능 리스트:", visibleItems);

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
                right: "280px",
                zIndex: 1,
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
                onClick={() => {
                    console.log("전체 보기 버튼 클릭:", !showAll);
                    setShowAll(!showAll);
                }}
            >
                {showAll ? "전체 보기 닫기" : "전체 보기"}
            </button>
        </div>
    );
};
