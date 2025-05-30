import React, { useEffect, useState } from "react";
import { sendHealthDataRequest } from "../../content/apiSetting/sendHealthDataRequest";
import Loading from "../Loading/component";

const healthEffectMap: Record<string, string> = {
    IMMUNE: "면역기능",
    SKIN: "피부건강",
    BLOOD: "혈액건강",
    BODY_FAT: "체지방 감소",
    BLOOD_SUGAR: "혈당조절",
    MEMORY: "기억력",
    ANTIOXIDANT: "항산화",
    GUT: "장건강",
    LIVER: "간건강",
    EYE: "눈건강",
    JOINT: "관절건강",
    SLEEP: "수면건강",
    STRESS_FATIGUE: "스트레스/피로개선",
    MENOPAUSE: "갱년기건강",
    PROSTATE: "전립선건강",
    URINARY: "요로건강",
    ENERGY: "에너지대사",
    BONE: "뼈건강",
    MUSCLE: "근력/운동수행능력",
    COGNITION: "인지기능",
    STOMACH: "위건강",
    ORAL: "구강건강",
    HAIR: "모발건강",
    GROWTH: "어린이 성장",
    BLOOD_PRESSURE: "혈압",
    URINATION: "배뇨건강",
    FOLATE: "엽산대사",
    NOSE: "코건강",
    MALE_HEALTH: "남성건강",
    ELECTROLYTE: "전해질 균형",
    DIETARY_FIBER: "식이섬유",
    ESSENTIAL_FATTY_ACID: "필수지방산",
};

export const HealthComponent = () => {
    const [healthTypes, setHealthTypes] = useState<string[] | null>(null);

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
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({ type: "GET_PRODUCT_TITLE" }, (res) => {
                if (chrome.runtime.lastError || !res?.title) {
                    console.warn("[voim][HealthComponent] title 가져오기 실패");
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

                if (!birthYear || !gender) return;

                const title = await getProductTitle();
                const response = await new Promise<{
                    html: string;
                    productId: string;
                }>((resolve, reject) => {
                    chrome.runtime.sendMessage(
                        { type: "FETCH_VENDOR_HTML" },
                        (res) => {
                            if (!res?.html?.trim() || !res?.productId) {
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
                    title,
                    html: response.html,
                    birthYear: Number(birthYear),
                    gender: gender.toUpperCase(),
                    allergies: Allergies || [],
                };

                const result = await sendHealthDataRequest(payload);

                setHealthTypes(result || []);
            } catch (e) {
                console.error("[voim] HEALTH API 실패:", e);
            }
        };

        fetchData();
    }, []);

    if (healthTypes === null) {
        return (
            <div
                style={{
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "320px",
                }}
            >
                <div style={{ width: "260px", height: "243px" }}>
                    <Loading />
                </div>
                <div
                    style={{
                        marginTop: "12px",
                        ...commonTextStyle24,
                        color: "#505156",
                    }}
                >
                    제품 정보를 분석 중입니다.
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                padding: "16px",
                backgroundColor: "#ffffff",
                fontFamily: "KoddiUDOnGothic",
            }}
        >
            <p style={commonTextStyle}>
                해당 제품의 기능성 효능 {healthTypes.length}가지
            </p>
            <div style={{ margin: "16px 0" }} />
            {healthTypes.length > 0 && (
                <div
                    style={{
                        backgroundColor: "#F5F7FB",
                        padding: "16px",
                        marginTop: "12px",
                        borderRadius: "12px",
                    }}
                >
                    {healthTypes.map((item, idx) => (
                        <div
                            key={idx}
                            style={{
                                backgroundColor: "#F5F7FB",
                                ...commonTextStyle24,
                                marginBottom:
                                    idx < healthTypes.length - 1 ? "12px" : "0",
                                borderBottom:
                                    idx < healthTypes.length - 1
                                        ? "1px solid #EAEDF4"
                                        : "none",
                                paddingBottom: "12px",
                            }}
                        >
                            {healthEffectMap[item] || item}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
