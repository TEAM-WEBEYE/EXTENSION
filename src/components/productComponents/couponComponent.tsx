import React, { useEffect, useState } from "react";
import { downloadAllCoupons } from "../../content/coupang/downloadAllCoupons";
import { checkCouponStatus } from "../../content/coupang/checkCouponStatus";

interface Props {
    coupons: string[];
}

export const CouponComponent: React.FC<Props> = ({ coupons }) => {
    const [downloaded, setDownloaded] = useState(false);
    const [status, setStatus] = useState<
        "none" | "downloadable" | "downloaded"
    >("downloadable");

    useEffect(() => {
        const currentStatus = checkCouponStatus();
        setStatus(currentStatus);
    }, []);

    useEffect(() => {
        const listener = () => {
            setDownloaded(true);
            setStatus("downloaded");
        };
        window.addEventListener("voim-coupon-downloaded", listener);
        return () =>
            window.removeEventListener("voim-coupon-downloaded", listener);
    }, []);

    if (status === "none" || !coupons || coupons.length === 0) return null;

    const commonTextStyle: React.CSSProperties = {
        fontFamily: "KoddiUD OnGothic",
        fontSize: "28px",
        fontStyle: "normal",
        fontWeight: 700,
        lineHeight: "150%",
        textAlign: "center",
    };

    const firstCoupon = coupons[0];
    const remainingCount = coupons.length - 1;

    const handleDownload = async () => {
        await downloadAllCoupons();
        setDownloaded(true);
        setStatus("downloaded");
    };

    return (
        <div
            style={{
                padding: "16px",
                borderRadius: "20px",
                width: "618px",
                border: "4px solid #8914FF",
                backgroundColor: "#ffffff",
            }}
        >
            <p style={commonTextStyle}>
                {status === "downloaded" || downloaded
                    ? "이미 다운로드한 쿠폰입니다 🎉"
                    : `${firstCoupon}${
                          remainingCount > 0
                              ? ` 외 ${remainingCount}종의 쿠폰이 있습니다.`
                              : ""
                      }`}
            </p>

            {status === "downloadable" && !downloaded && (
                <button
                    onClick={handleDownload}
                    style={{
                        width: "100%",
                        padding: "16px",
                        borderRadius: "16px",
                        backgroundColor: "#8914FF",
                        color: "white",
                        fontSize: "24px",
                        fontWeight: "bold",
                        marginTop: "20px",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    전체 쿠폰 다운로드
                </button>
            )}
        </div>
    );
};
