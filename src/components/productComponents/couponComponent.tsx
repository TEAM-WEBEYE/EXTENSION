import React from "react";
import { downloadAllCoupons } from "../../content/coupang/downloadAllCoupons";

interface Props {
    coupons: string[];
}

export const CouponComponent: React.FC<Props> = ({ coupons }) => {
    if (!coupons || coupons.length === 0) return null;

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
                {firstCoupon}
                {remainingCount > 0 &&
                    ` 외 ${remainingCount}종의 쿠폰이 있습니다.`}
            </p>
            <button
                onClick={downloadAllCoupons}
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
        </div>
    );
};
