import React, { useEffect, useState } from "react";

const INGREDIENT_KO_MAP: Record<string, string> = {
    avobenzone: "아보벤존",
    isopropylAlcohol: "이소프로필 알코올",
    sodiumLaurylSulfate: "소듐 라우릴/라우레스 설페이트",
    triethanolamine: "트리에탄올아민",
    polyethyleneGlycol: "폴리에틸렌 글라이콜",
    syntheticColorant: "합성 착색료",
    isopropylMethylphenol: "이소프로필 메틸페놀",
    sorbicAcid: "소르빅 애씨드",
    hormone: "호르몬류",
    dibutylHydroxyToluene: "디부틸 하이드록시 톨루엔 ",
    parabens: "파라벤류",
    triclosan: "트리클로산",
    butylatedHydroxyanisole: "부틸 하이드록시아니솔",
    oxybenzone: "옥시벤존",
    imidazolidinylUrea:
        "이미다졸리디닐 우레아, 디아졸리디닐 우레아, DMDM 하이단토인 등",
    mineralOil: "미네랄 오일, 파라핀오일",
    thymol: "티몰",
    triisopropanolamine: "트라이아이소프로판올아민",
    syntheticFragrance: "인공 향료",
    phenoxyethanol: "페녹시에탄올",
};

export const CosmeticComponent = () => {
    const [dangerIngredients, setDangerIngredients] = useState<string[]>([]);
    const [allergyIngredients, setAllergyIngredients] = useState<string[]>([]);
    const [dangerOpen, setDangerOpen] = useState(true);
    const [allergyOpen, setAllergyOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const commonTextStyle: React.CSSProperties = {
        fontFamily: "KoddiUD OnGothic",
        fontSize: "28px",
        fontStyle: "normal",
        fontWeight: 700,
        lineHeight: "150%",
        textAlign: "left",
    };

    useEffect(() => {
        const fetchData = async (vendorEl: Element) => {
            try {
                const productId =
                    window.location.href.match(/products\/(\d+)/)?.[1];
                if (!productId) {
                    console.warn("[voim] productId 없음");
                    return;
                }

                const rawHtml = vendorEl.outerHTML
                    .replace(/\sonerror=\"[^\"]*\"/g, "")
                    .replace(/\n/g, "")
                    .trim();

                if (!rawHtml.includes("<img")) {
                    console.warn("[voim] 전송할 HTML에 <img> 태그 없음");
                }

                chrome.runtime.sendMessage(
                    {
                        type: "FETCH_COSMETIC_DATA",
                        payload: { productId, html: rawHtml },
                    },
                    (res) => {
                        const data = res?.data || {};

                        const allList = Object.entries(data)
                            .filter(([_, v]) => v === true)
                            .map(([k]) => INGREDIENT_KO_MAP[k] || k);

                        setDangerIngredients(allList.slice(0, 20));
                        setAllergyIngredients(allList.slice(20));
                        setIsLoading(false);
                    },
                );
            } catch (e) {
                console.error("[voim] COSMETIC API 실패:", e);
                setIsLoading(false);
            }
        };

        const vendorEl = document.querySelector(".vendor-item");

        if (vendorEl) {
            fetchData(vendorEl);
        } else {
            const observer = new MutationObserver(() => {
                const target = document.querySelector(".vendor-item");
                if (target) {
                    observer.disconnect();
                    fetchData(target);
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });
            return () => observer.disconnect();
        }
    }, []);

    if (isLoading) {
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
                top: "580px",
                right: "280px",
                zIndex: 1,
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
                    {dangerIngredients.length > 0 ? (
                        dangerIngredients.map((item, idx) => (
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
                        ))
                    ) : (
                        <div
                            style={{
                                fontWeight: 500,
                                fontSize: "20px",
                                color: "#666",
                            }}
                        >
                            표시할 주의 성분이 없습니다.
                        </div>
                    )}
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
                    {allergyIngredients.length > 0 ? (
                        allergyIngredients.map((item, idx) => (
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
                        ))
                    ) : (
                        <div
                            style={{
                                fontWeight: 500,
                                fontSize: "20px",
                                color: "#666",
                            }}
                        >
                            표시할 알레르기 유발 성분이 없습니다.
                        </div>
                    )}
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
                onClick={() => setAllergyOpen(!allergyOpen)}
            >
                {allergyOpen
                    ? "전체 보기 닫기"
                    : "알레르기 유발 성분 전체 보기"}
            </button>
        </div>
    );
};
