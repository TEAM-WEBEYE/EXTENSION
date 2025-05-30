import React, { useEffect, useState } from "react";
import { sendFoodDataRequest } from "../../content/apiSetting/sendFoodDataRequest";
import Loading from "../Loading/component";
import { useTheme } from "@src/contexts/ThemeContext";

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
const allergyNameMap: Record<string, string> = {
    EGG: "계란",
    MILK: "우유",
    BUCKWHEAT: "메밀",
    PEANUT: "땅콩",
    SOYBEAN: "대두",
    WHEAT: "밀",
    PINE_NUT: "잣",
    WALNUT: "호두",
    CRAB: "게",
    SHRIMP: "새우",
    SQUID: "오징어",
    MACKEREL: "고등어",
    SHELLFISH: "조개류",
    PEACH: "복숭아",
    TOMATO: "토마토",
    CHICKEN: "닭고기",
    PORK: "돼지고기",
    BEEF: "쇠고기",
    SULFITE: "아황산류",
};

export const FoodComponent = () => {
    const { fontClasses, theme } = useTheme();
    const isDarkMode = theme === "dark";
    const [nutrientAlerts, setNutrientAlerts] = useState<Nutrient[] | null>(
        null,
    );
    const [allergyTypes, setAllergyTypes] = useState<string[] | null>(null);
    const [nutrientOpen, setNutrientOpen] = useState(true);
    const [allergyOpen, setAllergyOpen] = useState(true);

    const commonTextStyle: React.CSSProperties = {
        fontFamily: "KoddiUD OnGothic",
        fontSize: "28px",
        fontWeight: 700,
        lineHeight: "150%",
        textAlign: "left",
    };
    const commonTextStyle24: React.CSSProperties = {
        fontFamily: "KoddiUD OnGothic",
        fontSize: "24px",
        fontWeight: 700,
        lineHeight: "150%",
        textAlign: "left",
    };
    const getProductTitle = (): Promise<string> => {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ type: "GET_PRODUCT_TITLE" }, (res) => {
                if (chrome.runtime.lastError || !res?.title) {
                    console.warn("[voim][FoodComponent] title 가져오기 실패");
                    return resolve("");
                }
                resolve(res.title);
            });
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { birthYear, gender, Allergies } =
                    await chrome.storage.local.get([
                        "birthYear",
                        "gender",
                        "Allergies",
                    ]);

                console.debug("[voim] 스토리지에서 가져온 값:", {
                    birthYear,
                    gender,
                    Allergies,
                });

                if (!birthYear || !gender) return;
                const title = await getProductTitle();
                const response = await new Promise<{
                    html: string;
                    productId: string;
                }>((resolve, reject) => {
                    chrome.runtime.sendMessage(
                        { type: "FETCH_VENDOR_HTML" },
                        (res) => {
                            if (
                                chrome.runtime.lastError ||
                                !res?.html ||
                                !res?.productId ||
                                res.html.trim() === ""
                            ) {
                                console.warn(
                                    "[voim] FETCH_VENDOR_HTML 응답 없음, 대기 중...",
                                );
                                let retries = 10;
                                const interval = setInterval(() => {
                                    chrome.runtime.sendMessage(
                                        { type: "FETCH_VENDOR_HTML" },
                                        (retryRes) => {
                                            if (
                                                retryRes?.html?.trim() &&
                                                retryRes?.productId
                                            ) {
                                                clearInterval(interval);
                                                resolve(retryRes);
                                            } else if (--retries === 0) {
                                                clearInterval(interval);
                                                reject(
                                                    new Error(
                                                        "HTML 또는 productId 누락",
                                                    ),
                                                );
                                            }
                                        },
                                    );
                                }, 500);
                            } else {
                                resolve(res);
                            }
                        },
                    );
                });

                const payload = {
                    productId: response.productId,
                    title: title,
                    html: response.html,
                    birthYear: Number(birthYear),
                    gender: gender.toUpperCase(),
                    allergies: Allergies || [],
                };

                const result = await sendFoodDataRequest(payload);

                setNutrientAlerts(result.overRecommendationNutrients || []);
                setAllergyTypes(result.allergyTypes || []);
            } catch (e) {
                console.error("[voim] FOOD API 실패:", e);
            }
        };

        fetchData();
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
                className={`${fontClasses.fontCommon} ${
                    isDarkMode ? "text-grayscale-100" : "text-grayscale-900"
                }`}
            >
                <div>
                    <Loading />
                </div>
                <div
                    className={`${fontClasses.fontCommon} ${
                        isDarkMode ? "text-grayscale-100" : "text-grayscale-900"
                    }`}
                >
                    제품 정보를 분석 중입니다.
                </div>
            </div>
        );
    }

    return (
        <div
            className={`${fontClasses.fontCommon}  ${
                isDarkMode
                    ? "text-grayscale-100 bg-grayscale-900"
                    : "text-grayscale-900 bg-white"
            }`}
        >
            <p className={`${fontClasses.fontHeading} mb-[40px] `}>
                식품 영양 및 알러지 성분
            </p>

            <div
                className={`${fontClasses.fontCommon} ${
                    isDarkMode ? "text-grayscale-100" : "text-grayscale-900"
                }`}
            >
                <span>하루 기준 섭취량의 40% 넘는 영양성분</span>
                <span>총 {nutrientAlerts.length}개</span>
            </div>
            {nutrientOpen && nutrientAlerts.length > 0 && (
                <div
                    className={`${isDarkMode ? "bg-grayscale-800 " : "bg-grayscale-200 "} px-6 py-[18px] rounded-[14px] mt-4 mb-[30px]`}
                >
                    {nutrientAlerts.map((item, idx) => (
                        <div key={idx}>
                            <div
                                className={`${fontClasses.fontCommon} ${
                                    isDarkMode
                                        ? "text-grayscale-100"
                                        : "text-grayscale-900"
                                }`}
                            >
                                <span className="mr-1">
                                    {nutrientNameMap[item.nutrientType] ||
                                        item.nutrientType}{" "}
                                </span>
                                <span>{item.percentage}%</span>
                            </div>

                            {idx !== nutrientAlerts.length - 1 && (
                                <div
                                    className={`${
                                        isDarkMode
                                            ? "bg-grayscale-700"
                                            : "bg-grayscale-300"
                                    } my-[15px] w-full h-[2px]`}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div
                className={` ${fontClasses.fontCommon} ${
                    isDarkMode ? "text-grayscale-100" : "text-grayscale-900"
                }`}
            >
                <span>알레르기 유발 성분</span>
                <span>총 {allergyTypes.length}개</span>
            </div>
            {allergyOpen && allergyTypes.length > 0 && (
                <div
                    className={`${isDarkMode ? "bg-grayscale-800 " : "bg-grayscale-200 "} px-6 py-[18px] rounded-[14px] mt-4`}
                >
                    {allergyTypes.map((item, idx) => (
                        <div key={idx}>
                            <div
                                className={`${fontClasses.fontCommon} ${
                                    isDarkMode
                                        ? "text-grayscale-100"
                                        : "text-grayscale-900"
                                }`}
                            >
                                {allergyNameMap[item] || item}
                            </div>

                            {idx !== allergyTypes.length - 1 && (
                                <div
                                    className={`${
                                        isDarkMode
                                            ? "bg-grayscale-700"
                                            : "bg-grayscale-300"
                                    } my-[15px] w-full h-[2px]`}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
