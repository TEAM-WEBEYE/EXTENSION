import { BaseFillButton } from "@src/components/baseFillButton/component";
import { ThemeContextProvider, useTheme } from "@src/contexts/ThemeContext";
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "../../css/app.css";

export const MountCartSummaryApp = () => {
    const container = document.createElement("div");
    container.id = "coupang-cart-summary-root";
    container.style.margin = "20px 0";
    container.style.padding = "10px";

    const target = document.querySelector(".shopping-cart-new-layout");
    if (target && !document.getElementById("coupang-cart-summary-root")) {
        target.parentNode?.insertBefore(container, target);

        const root = createRoot(container);
        root.render(
            <ThemeContextProvider>
                <CartSummary />
            </ThemeContextProvider>,
        );
    }
};

interface CartItem {
    title: string;
    price: string;
    quantity: string;
}

const parseCartItems = (): CartItem[] => {
    const items: CartItem[] = [];
    const productNodes = document.querySelectorAll(".cart-deal-item");

    productNodes.forEach((node) => {
        const title =
            node.querySelector(".product-name")?.textContent?.trim() || "";
        const price =
            node.querySelector(".unit-total-sale-price")?.textContent?.trim() ||
            "";
        const quantity =
            (node.querySelector("input.quantity-input") as HTMLInputElement)
                ?.value || "1";

        if (title && price) {
            items.push({ title, price, quantity });
        }
        console.log(title, price, quantity);
    });

    return items;
};

const CartSummary = () => {
    const { fontClasses, theme } = useTheme();

    const [items, setItems] = useState<CartItem[]>([]);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        const found = parseCartItems();
        setItems(found);
    }, []);

    if (items.length === 0) return <p>장바구니에 상품이 없습니다.</p>;

    const visibleItems = showAll ? items : items.slice(0, 3);

    const totalPrice = items
        .reduce((acc, item) => {
            const numericPrice = Number(item.price.replace(/[^0-9]/g, ""));
            const quantity = Number(item.quantity);
            return acc + numericPrice * quantity;
        }, 0)
        .toLocaleString();

    return (
        <div className="rounded-[20px] border-4 font-koddi w-[563px] border-purple-default p-[28px]">
            <div
                className={`${fontClasses.fontHeading} flex flex-col gap-4 mb-[26px]`}
            >
                <div>장바구니 요약</div>
                <div className="text-purple-default">
                    총 {items.length}개의 상품이 담겨있습니다.
                </div>
            </div>

            <div
                className={`${fontClasses.fontCommon} flex justify-between mb-4`}
            >
                <div>전체 금액</div>
                <div>{totalPrice}원</div>
            </div>

            <div
                className={`${fontClasses.fontCommon} mb-[42px] bg-grayscale-200 px-[24px] py-[18px] rounded-[14px]`}
            >
                {visibleItems.map((item, idx) => (
                    <div key={idx}>
                        <div className="flex items-center justify-between">
                            <div className="w-1/2 truncate">{item.title}</div>
                            <div className="w-1/4 text-center">
                                {item.quantity}개
                            </div>
                            <div className="w-1/4 text-right">{item.price}</div>
                        </div>

                        {idx !== visibleItems.length - 1 && (
                            <div className="h-[2px] w-full bg-grayscale-300 my-[15px]" />
                        )}
                    </div>
                ))}
            </div>

            {items.length > 3 && (
                <BaseFillButton onClick={() => setShowAll((prev) => !prev)}>
                    {showAll ? "닫기" : "전체보기"}
                </BaseFillButton>
            )}
        </div>
    );
};
