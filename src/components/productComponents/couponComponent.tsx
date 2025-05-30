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

    const handleDownload = async () => {
        await downloadAllCoupons();
        setDownloaded(true);
        setStatus("downloaded");
    };

    return (
        <div>
            {status === "downloadable" && !downloaded && (
                <button
                    onClick={handleDownload}
                    style={{
                        width: "100%",
                        padding: "16px",
                        backgroundColor: "#8914FF",
                        color: "white",
                        fontSize: "24px",
                        fontWeight: "bold",
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
