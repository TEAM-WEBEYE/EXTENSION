import React from "react";
import { createRoot } from "react-dom/client";
import { CouponComponent } from "../../components/productComponents/couponComponent";

export const renderCouponComponent = () => {
    console.log("[voim] 쿠폰 컴포넌트 렌더링 시작");

    const couponLayer = document.querySelector(".prod-coupon-download-layer");
    if (!couponLayer) {
        console.log("[voim] 쿠폰 레이어를 찾을 수 없음");
        return;
    }

    const couponItems = document.querySelectorAll(
        ".prod-coupon-download-content li.prod-coupon-download-item__on",
    );

    console.log("[voim] 감지된 쿠폰 DOM 요소 개수:", couponItems.length);

    const couponTexts = Array.from(couponItems)
        .map((item, i) => {
            const price = item
                .querySelector(".prod-coupon-price")
                ?.textContent?.trim();
            const desc = item
                .querySelector(".prod-coupon-desc")
                ?.textContent?.trim();

            if (price && desc) {
                const fullText = `${price} 할인 - ${desc}`;
                console.log(`[voim] 쿠폰 #${i + 1}:`, fullText);
                return fullText;
            }

            console.warn(`[voim] 쿠폰 #${i + 1}는 price 또는 desc가 누락됨`, {
                price,
                desc,
            });

            return null;
        })
        .filter((text): text is string => !!text);

    console.log("[voim] 최종 쿠폰 텍스트 목록:", couponTexts);

    if (couponTexts.length === 0) {
        console.log("[voim] 쿠폰 텍스트가 비어 있음, 렌더링 생략");
        return;
    }

    if (document.getElementById("voim-coupon-component")) {
        console.log("[voim] 이미 쿠폰 컴포넌트가 렌더링되어 있음");
        return;
    }

    const container = document.createElement("div");
    container.id = "voim-coupon-component";
    container.style.position = "absolute";
    container.style.top = "390px";
    container.style.right = "490px";
    container.style.zIndex = "9999";
    document.body.appendChild(container);

    const root = createRoot(container);
    root.render(<CouponComponent coupons={couponTexts} />);
    console.log("[voim] 쿠폰 컴포넌트 렌더링 완료");
};
