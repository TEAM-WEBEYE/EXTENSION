export const handleHealthDataFetch = async (
    message: any,
    sender: any,
    sendResponse: any,
) => {
    const { productId, title, html, birthYear, gender, allergies } =
        message.payload;

    fetch("https://voim.store/api/v1/health-food/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            productId,
            title,
            html,
            birthYear,
            gender,
            allergies,
        }),
    })
        .then((res) => res.json())
        .then((data) => {
            if (sender.tab?.id) {
                chrome.tabs.sendMessage(sender.tab.id, {
                    type: "HEALTH_DATA_RESPONSE",
                    data: data.data,
                });
            }
            sendResponse({ type: "HEALTH_DATA_RESPONSE", data: data.data });
        })
        .catch((err) => {
            console.error("HEALTH 요청 실패:", err);
            if (sender.tab?.id) {
                chrome.tabs.sendMessage(sender.tab.id, {
                    type: "HEALTH_DATA_ERROR",
                    error: err.message,
                });
            }
            sendResponse({ type: "HEALTH_DATA_ERROR", error: err.message });
        });
};
