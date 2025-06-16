export const handlePageTypeMessage = async (
    message: any,
    sender: any,
    sendResponse: any,
) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab?.id) {
            chrome.tabs.sendMessage(
                activeTab.id,
                {
                    type: "PAGE_TYPE",
                    value: message.value,
                },
                (response) => {
                    sendResponse(response);
                },
            );
        }
    });
};

export const handleCartPageMessage = async (
    message: any,
    sender: any,
    sendResponse: any,
) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab?.id) {
            chrome.tabs.sendMessage(
                activeTab.id,
                {
                    type: "CART_PAGE",
                    value: message.value,
                },
                (response) => {
                    sendResponse(response);
                },
            );
        }
    });
};

export const handleCartItemsUpdated = async (
    message: any,
    sender: any,
    sendResponse: any,
) => {
    chrome.storage.local.set({ cartItems: message.data }, () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            if (activeTab?.id) {
                chrome.tabs
                    .sendMessage(activeTab.id, {
                        type: "CART_ITEMS_UPDATED",
                        data: message.data,
                    })
                    .catch(() => {
                        // 메시지 전송 실패 시 무시
                    });
            }
        });
    });
};

export const handleVendorHtmlFetch = async (
    message: any,
    sender: any,
    sendResponse: any,
) => {
    if (sender.tab?.id) {
        chrome.tabs.sendMessage(
            sender.tab.id,
            { type: "GET_VENDOR_HTML" },
            (response) => {
                sendResponse(response);
            },
        );
    }
};

export const handleProductTitleFetch = async (
    message: any,
    sender: any,
    sendResponse: any,
) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0]?.id;
        if (!tabId) {
            sendResponse({ title: "" });
            return;
        }

        chrome.tabs.sendMessage(
            tabId,
            { type: "GET_PRODUCT_TITLE" },
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error(
                        "[voim][background] title 요청 실패:",
                        chrome.runtime.lastError.message,
                    );
                    sendResponse({ title: "" });
                } else {
                    sendResponse(response);
                }
            },
        );
    });
};
