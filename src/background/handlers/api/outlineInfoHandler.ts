export const handleOutlineInfoFetch = async (
    message: any,
    sender: any,
    sendResponse: any,
) => {
    const { outline, html } = message.payload;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (!activeTab?.url) {
            sendResponse({
                type: "OUTLINE_INFO_ERROR",
                error: "상품 페이지를 찾을 수 없습니다.",
            });
            return;
        }

        const productId = activeTab.url.match(/vp\/products\/(\d+)/)?.[1];
        if (!productId) {
            sendResponse({
                type: "OUTLINE_INFO_ERROR",
                error: "상품 ID를 찾을 수 없습니다.",
            });
            return;
        }

        fetch(`https://voim.store/api/v1/product-detail/${outline}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ html, productId }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (sender.tab?.id) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        type: "OUTLINE_INFO_RESPONSE",
                        data: data.data,
                    });
                }
                sendResponse({
                    type: "OUTLINE_INFO_RESPONSE",
                    data: data.data,
                });
            })
            .catch((err) => {
                console.error("OUTLINE INFO 오류:", err);
                if (sender.tab?.id) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        type: "OUTLINE_INFO_ERROR",
                        error: err.message,
                    });
                }
                sendResponse({
                    type: "OUTLINE_INFO_ERROR",
                    error: err.message,
                });
            });
    });
};
