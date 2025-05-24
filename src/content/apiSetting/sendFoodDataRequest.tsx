interface FoodRequestPayload {
    productId: string;
    title: string;
    html: string;
    birthYear: number;
    gender: string;
    allergies: string[];
}

interface Nutrient {
    nutrientType: string;
    percentage: number;
}

interface FoodAPIResponse {
    status: number;
    message?: string;
    data?: {
        allergyTypes: string[];
        overRecommendationNutrients: Nutrient[];
    };
}

export const sendFoodDataRequest = (
    payload: FoodRequestPayload,
): Promise<FoodAPIResponse["data"]> => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            {
                type: "FETCH_FOOD_DATA",
                payload,
            },
            (response: unknown) => {
                console.log("[voim] 받은 응답 전체:", response);

                if (!response || typeof response !== "object") {
                    return reject(new Error("Invalid response format"));
                }

                const res = response as {
                    status: number;
                    data: FoodAPIResponse;
                };

                if (res.status !== 200) {
                    return reject(new Error(`API 실패 status: ${res.status}`));
                }

                const actual = res.data?.data;

                if (!actual) {
                    return reject(new Error("data.data 필드가 없습니다"));
                }

                const { allergyTypes, overRecommendationNutrients } = actual;

                const nutrientsValid =
                    Array.isArray(overRecommendationNutrients) &&
                    overRecommendationNutrients.every(
                        (n) =>
                            typeof n.nutrientType === "string" &&
                            typeof n.percentage === "number",
                    );

                const allergiesValid =
                    Array.isArray(allergyTypes) &&
                    allergyTypes.every((item) => typeof item === "string");

                if (nutrientsValid && allergiesValid) {
                    resolve(actual);
                } else {
                    console.error(" allergyTypes or nutrients 타입 오류", {
                        allergyTypes,
                        overRecommendationNutrients,
                    });
                    reject(
                        new Error(
                            "올바른 형식의 allergyTypes 또는 overRecommendationNutrients가 아님",
                        ),
                    );
                }
            },
        );
    });
};
