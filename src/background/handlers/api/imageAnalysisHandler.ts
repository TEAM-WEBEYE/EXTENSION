import { logger } from "@src/utils/logger";

export const handleImageAnalysisFetch = async (
    message: any,
    sender: any,
    sendResponse: any,
) => {
    const imageUrl = message.payload?.url;

    fetch("https://voim.store/api/v1/image-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: imageUrl }),
    })
        .then((res) => res.json())
        .then((data) => {
            logger.debug("이미지 분석 API 응답:", data);
            if (sender.tab?.id) {
                chrome.tabs.sendMessage(sender.tab.id, {
                    type: "IMAGE_ANALYSIS_RESPONSE",
                    data: data.data,
                });
            }
            sendResponse({
                type: "IMAGE_ANALYSIS_RESPONSE",
                data: data.data,
            });
        })
        .catch((err) => {
            console.error("이미지 분석 에러:", err);
            if (sender.tab?.id) {
                chrome.tabs.sendMessage(sender.tab.id, {
                    type: "IMAGE_ANALYSIS_ERROR",
                    error: err.message,
                });
            }
            sendResponse({
                type: "IMAGE_ANALYSIS_ERROR",
                error: err.message,
            });
        });
};
