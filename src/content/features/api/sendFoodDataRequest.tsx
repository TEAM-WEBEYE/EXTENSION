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
        nutrientResponse: {
            nutrientReferenceAmount: number;
            overRecommendationNutrients: Nutrient[];
        };
    };
}
export const sendFoodDataRequest = (
    payload: FoodRequestPayload,
): Promise<{
    allergyTypes: string[];
    overRecommendationNutrients: Nutrient[];
}> => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            {
                type: "FETCH_FOOD_DATA",
                payload,
            },
            (response: unknown) => {
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

                const data = res.data?.data;

                if (
                    !data ||
                    !data.nutrientResponse ||
                    !Array.isArray(data.allergyTypes)
                ) {
                    return reject(new Error("올바르지 않은 응답 형식"));
                }

                const { allergyTypes, nutrientResponse } = data;
                const overRecommendationNutrients =
                    nutrientResponse.overRecommendationNutrients;

                const nutrientsValid =
                    Array.isArray(overRecommendationNutrients) &&
                    overRecommendationNutrients.every(
                        (n) =>
                            typeof n.nutrientType === "string" &&
                            typeof n.percentage === "number",
                    );

                const allergiesValid = allergyTypes.every(
                    (item) => typeof item === "string",
                );

                if (nutrientsValid && allergiesValid) {
                    resolve({
                        allergyTypes,
                        overRecommendationNutrients,
                    });
                } else {
                    console.error("응답 검증 실패:", {
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
