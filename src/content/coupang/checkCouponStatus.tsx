export const checkCouponStatus = (): "none" | "downloadable" | "downloaded" => {
    const downloadBtn = document.querySelector(
        ".prod-coupon-download-btn",
    ) as HTMLElement;

    if (!downloadBtn || downloadBtn.style.display === "none") {
        return "none";
    }

    const downloadable = document.querySelectorAll(
        ".prod-coupon-download-item__on[data-url]",
    );
    const downloaded = document.querySelectorAll(
        ".prod-coupon-download-item__off[data-url]",
    );

    if (downloadable.length > 0) {
        return "downloadable";
    }

    if (downloaded.length > 0) {
        return "downloaded";
    }

    return "none";
};
