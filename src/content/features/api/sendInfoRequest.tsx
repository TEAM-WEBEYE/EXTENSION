export const sendOutlineInfoRequest = (
    outline: "MAIN" | "USAGE" | "WARNING" | "SPECS" | "CERTIFICATION",
    html: string,
): Promise<string> => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            {
                type: "FETCH_OUTLINE_INFO",
                payload: { outline, html },
            },
            (response) => {
                if (chrome.runtime.lastError) {
                    return reject(new Error(chrome.runtime.lastError.message));
                }

                if (response?.type === "OUTLINE_INFO_RESPONSE") {
                    const detail = response.data?.detail;
                    if (typeof detail === "string") {
                        resolve(detail);
                    } else {
                        console.warn(
                            "[voim] 응답은 왔지만 detail 없음:",
                            response.data,
                        );
                        reject(new Error("서버 응답에 detail이 없습니다."));
                    }
                } else if (response?.type === "OUTLINE_INFO_ERROR") {
                    reject(new Error(response.error));
                } else {
                    reject(new Error("Unknown response format"));
                }
            },
        );
    });
};
