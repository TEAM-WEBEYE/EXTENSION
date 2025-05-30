import React, { useEffect, useState } from "react";
import { sendCosmeticDataRequest } from "../../content/apiSetting/sendCosmeticDataRequest";
import Loading from "../Loading/component";
import { useTheme } from "@src/contexts/ThemeContext";

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
    const { fontClasses, theme } = useTheme();
    const isDarkMode = theme === "dark";
    const [detectedIngredients, setDetectedIngredients] = useState<string[]>(
        [],
    );
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
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

                const { html, productId } = response;
                const detectedKeys = await sendCosmeticDataRequest({
                    productId,
                    html,
                });
                const detected = detectedKeys.map(
                    (key) => INGREDIENT_KO_MAP[key] || key,
                );

                setDetectedIngredients(detected);
                setIsLoading(false);
            } catch (err) {
                console.error("[voim] 화장품 성분 분석 실패:", err);
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div
                className={`${fontClasses.fontCommon} ${isDarkMode ? "text-grayscale-100" : "text-grayscale-900"}`}
            >
                <div>
                    <Loading />
                </div>
                <div
                    className={`${fontClasses.fontCommon} ${isDarkMode ? "text-grayscale-100" : "text-grayscale-900"}`}
                >
                    제품 정보를 분석 중입니다.
                </div>
            </div>
        );
    }

    return (
        <div
            className={`${fontClasses.fontCommon} ${isDarkMode ? "text-grayscale-100 bg-grayscale-900" : "text-grayscale-900 bg-white"}`}
        >
            <p className={`${fontClasses.fontHeading} mb-[40px]`}>
                [화장품] 성분 안내
            </p>

            <div
                className={`${fontClasses.fontCommon} ${isDarkMode ? "text-grayscale-100" : "text-grayscale-900"}`}
            >
                <span>검출된 성분</span>
                <span>총 {detectedIngredients.length}개</span>
            </div>

            {detectedIngredients.length > 0 && (
                <div
                    className={`${isDarkMode ? "bg-grayscale-800" : "bg-grayscale-200"} px-6 py-[18px] rounded-[14px] mt-4`}
                >
                    {detectedIngredients.map((item, idx) => (
                        <div key={idx}>
                            <div
                                className={`${fontClasses.fontCommon} ${isDarkMode ? "text-grayscale-100" : "text-grayscale-900"}`}
                            >
                                {item}
                            </div>
                            {idx !== detectedIngredients.length - 1 && (
                                <div
                                    className={`${isDarkMode ? "bg-grayscale-700" : "bg-grayscale-300"} my-[15px] w-full h-[2px]`}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
