export const handleCosmeticDataFetch = async (
    message: any,
    sender: any,
    sendResponse: any,
) => {
    const { productId, html } = message.payload;

    fetch("https://voim.store/api/v1/cosmetic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, html }),
    })
        .then(async (res) => {
            const json = await res.json();
            return json;
        })
        .then((data) => {
            const raw = data?.data;

            if (!raw || typeof raw !== "object") {
                console.warn("[voim][background] data.data 형식 이상함:", raw);
                sendResponse({
                    type: "COSMETIC_DATA_ERROR",
                    error: "API 응답 형식 오류",
                });
                return;
            }

            sendResponse({
                type: "COSMETIC_DATA_RESPONSE",
                data: raw,
            });

            if (sender.tab?.id) {
                chrome.tabs.sendMessage(sender.tab.id, {
                    type: "COSMETIC_DATA_RESPONSE",
                    data: raw,
                });
            }
        })
        .catch((err) => {
            console.error("[voim][background] COSMETIC 요청 실패:", err);
            sendResponse({
                type: "COSMETIC_DATA_ERROR",
                error: err.message,
            });

            if (sender.tab?.id) {
                chrome.tabs.sendMessage(sender.tab.id, {
                    type: "COSMETIC_DATA_ERROR",
                    error: err.message,
                });
            }
        });
};
