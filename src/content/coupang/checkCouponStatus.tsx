export const checkCouponStatus = (): "none" | "downloadable" | "downloaded" => {
    const downloadBtn = document.querySelector(
        ".prod-coupon-download-btn",
    ) as HTMLElement;
    console.log("[voim][쿠폰 체크] downloadBtn:", downloadBtn);

    if (!downloadBtn || downloadBtn.style.display === "none") {
        console.log("[voim][쿠폰 체크] 버튼이 없거나 display:none → 쿠폰 없음");
        return "none";
    }

    const downloadable = document.querySelectorAll(
        ".prod-coupon-download-item__on[data-url]",
    );
    const downloaded = document.querySelectorAll(
        ".prod-coupon-download-item__off[data-url]",
    );

    console.log(
        "[voim][쿠폰 체크] 다운로드 가능 항목 수:",
        downloadable.length,
    );
    console.log("[voim][쿠폰 체크] 이미 받은 항목 수:", downloaded.length);

    if (downloadable.length > 0) {
        console.log("[voim][쿠폰 체크] → 다운로드 가능한 쿠폰 있음");
        return "downloadable";
    }

    if (downloaded.length > 0) {
        console.log("[voim][쿠폰 체크] → 이미 받은 쿠폰만 존재함");
        return "downloaded";
    }

    console.log("[voim][쿠폰 체크] → 쿠폰 항목이 전혀 없음");
    return "none";
};
