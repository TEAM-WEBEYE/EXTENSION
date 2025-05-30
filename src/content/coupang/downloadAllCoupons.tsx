export const downloadAllCoupons = async (): Promise<void> => {
    const items = document.querySelectorAll(
        ".prod-coupon-download-item__on[data-url]",
    );

    if (items.length === 0) {
        return;
    }

    const promises = Array.from(items).map((item, index) => {
        const url = (item as HTMLElement).getAttribute("data-url");
        if (!url) return Promise.resolve();

        const fullUrl = `https://www.coupang.com${url}`;
        return fetch(fullUrl, {
            method: "GET",
            credentials: "include",
        })
            .then((res) => {
                if (res.ok) {
                } else {
                    console.warn(`[voim] 쿠폰 ${index + 1} 실패:`, res.status);
                }
            })
            .catch((err) => {
                console.error(`[voim] 쿠폰 ${index + 1} 오류:`, err);
            });
    });

    await Promise.all(promises);
    window.dispatchEvent(new Event("voim-coupon-downloaded"));
};
