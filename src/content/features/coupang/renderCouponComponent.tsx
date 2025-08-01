// content.ts
export const renderCouponComponent = () => {
    const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

    let isDownloaded = false;
    let isDownloading = false;
    const clickedUrls = new Set<string>();

    const tryDownloadCoupons = async () => {
        if (isDownloaded || isDownloading) {
            return true;
        }

        isDownloading = true;

        const downloadBtn = document.querySelector(
            ".prod-coupon-download-btn",
        ) as HTMLButtonElement | null;

        if (!downloadBtn) {
            isDownloading = false;
            return false;
        }

        const couponLayer = document.querySelector(
            ".prod-coupon-download-layer",
        ) as HTMLElement | null;

        if (!couponLayer) {
            isDownloading = false;
            return false;
        }

        const originalDisplay = couponLayer.style.display;
        couponLayer.style.display = "block";

        await wait(300);

        const couponItems = document.querySelectorAll<HTMLLIElement>(
            ".prod-coupon-download-content li.prod-coupon-download-item__on",
        );

        let newDownload = false;

        couponItems.forEach((item, index) => {
            const url = item.getAttribute("data-url");
            if (!url) return;

            if (!clickedUrls.has(url)) {
                clickedUrls.add(url);
                item.click();
                newDownload = true;
            }
        });

        // 알림 자동 확인 (예: alert 대체)
        await wait(300);
        const closeBtn = document.querySelector(
            ".prod-coupon-download-close",
        ) as HTMLElement | null;
        if (closeBtn) {
            closeBtn.click();
        }

        // 레이어 원복
        couponLayer.style.display = originalDisplay;

        if (newDownload) {
            isDownloaded = true;

            downloadBtn.disabled = true;
            downloadBtn.style.opacity = "0.5";
            downloadBtn.style.cursor = "not-allowed";
            downloadBtn.style.border = "1px solid #999";
            downloadBtn.style.color = "#999";
            downloadBtn.style.filter = "grayscale(100%)";
        } else {
            downloadBtn.disabled = true;
            downloadBtn.style.opacity = "0.5";
            downloadBtn.style.cursor = "not-allowed";
            downloadBtn.style.border = "1px solid #999";
            downloadBtn.style.color = "#999";
            downloadBtn.style.filter = "grayscale(100%)";
        }

        isDownloading = false;
        return true;
    };

    // 초기 실행
    tryDownloadCoupons().catch(console.error);

    // DOM 변화 감지
    const observer = new MutationObserver((mutations, obs) => {
        if (isDownloaded) {
            obs.disconnect();
            return;
        }

        tryDownloadCoupons()
            .then((success) => {
                if (success) {
                    obs.disconnect();
                }
            })
            .catch(console.error);
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    // 10초 후 자동 종료
    setTimeout(() => {
        observer.disconnect();
    }, 10000);
};
