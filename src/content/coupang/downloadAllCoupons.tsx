export const downloadAllCoupons = () => {
    const items = document.querySelectorAll(
        ".prod-coupon-download-item__on[data-url]",
    );

    if (items.length === 0) {
        console.log("[voim] 다운로드 가능한 쿠폰이 없습니다.");
        return;
    }

    console.log(`[voim] ${items.length}개의 쿠폰을 다운로드합니다.`);

    items.forEach((item, index) => {
        const url = (item as HTMLElement).getAttribute("data-url");
        if (url) {
            const fullUrl = `https://www.coupang.com${url}`;
            fetch(fullUrl, {
                method: "GET",
                credentials: "include",
            })
                .then((res) => {
                    if (res.ok) {
                        console.log(`[voim] 쿠폰 ${index + 1} 다운로드 성공`);
                    } else {
                        console.warn(
                            `[voim] 쿠폰 ${index + 1} 실패:`,
                            res.status,
                        );
                    }
                })
                .catch((err) => {
                    console.error(`[voim] 쿠폰 ${index + 1} 오류:`, err);
                });
        }
    });
};
