interface HealthRequestPayload {
    productId: string;
    title: string;
    html: string;
    birthYear: number;
    gender: string;
    allergies: string[];
}

interface HealthAPIResponse {
    types: string[];
}

export const sendHealthDataRequest = (
    payload: HealthRequestPayload,
): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            {
                type: "FETCH_HEALTH_DATA",
                payload,
            },
            (response: unknown) => {
                if (!response || typeof response !== "object") {
                    console.error(
                        "[voim] HEALTH API 응답 형식 오류:",
                        response,
                    );
                    return reject(new Error("Invalid response format"));
                }

                const res = response as {
                    type: string;
                    data?: HealthAPIResponse;
                    error?: string;
                };

                if (res.type === "HEALTH_DATA_RESPONSE" && res.data?.types) {
                    resolve(res.data.types);
                } else {
                    console.error(
                        "[voim] HEALTH API 실패 응답:",
                        res.error ?? res,
                    );
                    reject(new Error(res.error ?? "Health API 응답 오류"));
                }
            },
        );
    });
};
