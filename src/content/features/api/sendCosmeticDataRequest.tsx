interface CosmeticRequestPayload {
    productId: string;
    html: string;
}

interface CosmeticAPIResponse {
    type: string;
    data?: Record<string, boolean>;
    error?: string;
}

export const sendCosmeticDataRequest = (
    payload: CosmeticRequestPayload,
): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            {
                type: "FETCH_COSMETIC_DATA",
                payload,
            },
            (response: unknown) => {
                console.log("[voim] ⬅️ 응답 확인:", response);
                if (!response || typeof response !== "object") {
                    return reject(new Error("Invalid response format"));
                }

                const res = response as CosmeticAPIResponse;

                if (!res.data || typeof res.data !== "object") {
                    return reject(
                        new Error("data 필드가 없거나 잘못된 형식입니다."),
                    );
                }

                const detected = Object.entries(res.data)
                    .filter(([_, v]) => v === true)
                    .map(([k]) => k);

                resolve(detected);
            },
        );
    });
};
