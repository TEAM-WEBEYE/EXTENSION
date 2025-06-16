export const handleReviewSummaryFetch = async (
    message: any,
    sender: any,
    sendResponse: any,
) => {
    const { productId, reviewRating, reviews } = message.payload;

    fetch("https://voim.store/api/v1/review/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, reviewRating, reviews }),
    })
        .then(async (res) => {
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(
                    errorData.message || `HTTP error! status: ${res.status}`,
                );
            }
            return res.json();
        })
        .then((data) => {
            if (!data.data) {
                throw new Error("서버 응답에 데이터가 없습니다.");
            }

            if (sender.tab?.id) {
                chrome.tabs.sendMessage(sender.tab.id, {
                    type: "REVIEW_SUMMARY_RESPONSE",
                    data: data.data,
                });
            }
            sendResponse({
                type: "REVIEW_SUMMARY_RESPONSE",
                data: data.data,
            });
        })
        .catch((err) => {
            console.error("[voim] REVIEW SUMMARY 오류:", err);
            const errorMessage =
                err.message || "리뷰 요약 처리 중 오류가 발생했습니다";

            if (sender.tab?.id) {
                chrome.tabs.sendMessage(sender.tab.id, {
                    type: "REVIEW_SUMMARY_ERROR",
                    error: errorMessage,
                });
            }
            sendResponse({
                type: "REVIEW_SUMMARY_ERROR",
                error: errorMessage,
            });
        });
};
