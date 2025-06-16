export const handleFoodDataFetch = async (
    message: any,
    sender: any,
    sendResponse: any,
) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (!activeTab?.url) {
            sendResponse({
                status: 400,
                error: "상품 페이지를 찾을 수 없습니다.",
            });
            return;
        }

        const productId = activeTab.url.match(/vp\/products\/(\d+)/)?.[1];
        if (!productId) {
            sendResponse({
                status: 400,
                error: "상품 ID를 찾을 수 없습니다.",
            });
            return;
        }

        const payload = {
            ...message.payload,
            productId,
        };

        fetch("https://voim.store/api/v1/products/foods", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }).then(async (res) => {
            const text = await res.text();

            try {
                const json = JSON.parse(text);
                if (res.ok) {
                    sendResponse({ status: 200, data: json });
                } else {
                    sendResponse({
                        status: res.status,
                        error: json?.message ?? "에러 발생",
                    });
                }
            } catch (err) {
                console.error("[voim] JSON 파싱 실패", text);
                sendResponse({
                    status: res.status,
                    error: "JSON 파싱 실패",
                });
            }
        });
    });
};
