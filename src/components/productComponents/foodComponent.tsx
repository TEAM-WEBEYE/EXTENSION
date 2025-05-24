import React, { useEffect, useState } from "react";
import { sendFoodDataRequest } from "../../content/apiSetting/sendFoodDataRequest";

interface Nutrient {
    nutrientType: string;
    percentage: number;
}

const nutrientNameMap: Record<string, string> = {
    SODIUM: "나트륨",
    CARBOHYDRATE: "탄수화물",
    SUGARS: "당류",
    FAT: "지방",
    TRANS_FAT: "트랜스지방",
    SATURATED_FAT: "포화지방",
    CHOLESTEROL: "콜레스테롤",
    PROTEIN: "단백질",
    CALCIUM: "칼슘",
    PHOSPHORUS: "인",
    NIACIN: "나이아신",
    VITAMIN_B: "비타민 B",
    VITAMIN_E: "비타민 E",
};

export const FoodComponent = () => {
    const [nutrientAlerts, setNutrientAlerts] = useState<Nutrient[] | null>(
        null,
    );
    const [allergyTypes, setAllergyTypes] = useState<string[] | null>(null);
    const [nutrientOpen, setNutrientOpen] = useState(true);
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
        const fetchData = async (vendorEl: Element) => {
            try {
                const { birthYear, gender } = await chrome.storage.local.get([
                    "birthYear",
                    "gender",
                ]);

                const productId =
                    window.location.href.match(/products\/(\d+)/)?.[1];
                if (!birthYear || !gender || !productId) return;

                const rawHtml = vendorEl.outerHTML
                    .replace(/\sonerror=\"[^\"]*\"/g, "")
                    .replace(/\n/g, "")
                    .trim();

                const payload = {
                    productId,
                    title: document.title,
                    html: rawHtml,
                    birthYear: Number(birthYear),
                    gender: gender.toUpperCase(),
                    allergies: [],
                };

                const res = await sendFoodDataRequest(payload);
                if (!res) throw new Error("응답 없음");

                setNutrientAlerts(res.overRecommendationNutrients || []);
                setAllergyTypes(res.allergyTypes || []);
            } catch (e) {
                console.error("[voim] FOOD API 실패:", e);
            }
        };

        const vendorEl = document.querySelector(".vendor-item");
        if (vendorEl) {
            console.log("[voim] .vendor-item DOM에서 바로 발견됨");
            fetchData(vendorEl);
            return;
        }

        const observer = new MutationObserver(() => {
            const foundEl = document.querySelector(".vendor-item");
            if (foundEl) {
                console.log("[voim] .vendor-item 등장 감지됨 (observer)");
                observer.disconnect();
                fetchData(foundEl);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (nutrientAlerts === null || allergyTypes === null) {
                console.warn("[voim] 데이터 로딩 타임아웃: 기본값 처리");
                setNutrientAlerts([]);
                setAllergyTypes([]);
            }
        }, 10000);

        return () => clearTimeout(timeout);
    }, [nutrientAlerts, allergyTypes]);

    if (nutrientAlerts === null || allergyTypes === null) {
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
                제품 정보를 분석 중입니다...
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
            <p style={commonTextStyle}>
                [식품] 영양 및 알레르기 유발 식재료 안내
            </p>

            <div
                style={{
                    borderTop: "1px solid #EAEDF4",
                    margin: "16px 0",
                }}
            />

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                    fontSize: "24px",
                    fontStyle: "normal",
                    fontWeight: 700,
                    fontFamily: "KoddiUDOnGothic",
                }}
            >
                <span>하루 기준 섭취량의 40% 넘는 영양성분</span>
                <span>총 {nutrientAlerts.length}개</span>
            </div>

            {nutrientOpen && (
                <div
                    style={{
                        backgroundColor: "#F5F7FB",
                        borderRadius: "12px",
                        padding: "16px",
                        marginBottom: "16px",
                    }}
                >
                    {nutrientAlerts.map((item, idx) => (
                        <div
                            key={idx}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: "24px",
                                fontStyle: "normal",
                                fontWeight: 700,
                                fontFamily: "KoddiUDOnGothic",
                                marginBottom:
                                    idx < nutrientAlerts.length - 1
                                        ? "12px"
                                        : "0",
                            }}
                        >
                            <span>
                                {nutrientNameMap[item.nutrientType] ||
                                    item.nutrientType}
                            </span>
                            <span>{item.percentage}%</span>
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
                onClick={() => setNutrientOpen(!nutrientOpen)}
            >
                {nutrientOpen ? "전체 보기 닫기" : "전체 보기"}
            </button>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                    fontWeight: "bold",
                }}
            >
                <span>알레르기 유발 성분</span>
                <span>총 {allergyTypes.length}개</span>
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
                    {allergyTypes.map((item, idx) => (
                        <div
                            key={idx}
                            style={{
                                fontWeight: 600,
                                marginBottom:
                                    idx < allergyTypes.length - 1
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
                    cursor: "pointer",
                }}
                onClick={() => setAllergyOpen(!allergyOpen)}
            >
                {allergyOpen
                    ? "전체 보기 닫기"
                    : "알레르기 유발 식품 전체 보기"}
            </button>
        </div>
    );
};
