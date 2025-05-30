export const sendImageAnalysisRequest = (imageUrl: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            {
                type: "FETCH_IMAGE_ANALYSIS",
                payload: { url: imageUrl },
            },
            (response) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else if (response?.type === "IMAGE_ANALYSIS_RESPONSE") {
                    resolve(response.data.analysis);
                } else if (response?.type === "IMAGE_ANALYSIS_ERROR") {
                    reject(new Error(response.error));
                } else {
                    reject(new Error("Unknown response format"));
                }
            },
        );
    });
};
