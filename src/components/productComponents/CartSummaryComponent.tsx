import { useTheme } from "@src/contexts/ThemeContext";
import React, { useEffect, useState } from "react";

interface CartItem {
    name: string;
    quantity: number;
    price: number;
    originalPrice: number;
    discountRate: number;
}

const CartSummaryComponent: React.FC = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const { theme, fontClasses } = useTheme();
    const isDarkMode = theme === "dark";

    useEffect(() => {
        chrome.storage.local.get(["cartItems"], (result) => {
            if (result.cartItems) {
                setCartItems(result.cartItems);
            }
        });

        const handleMessage = (message: any) => {
            if (message.type === "CART_ITEMS_UPDATED") {
                setCartItems(message.data);
            }
        };

        chrome.runtime.onMessage.addListener(handleMessage);

        return () => {
            chrome.runtime.onMessage.removeListener(handleMessage);
        };
    }, []);

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);

    return (
        <div
            className={`py-[20px] px-[24px] ${fontClasses.fontCommon} ${isDarkMode ? "bg-grayscale-900 rounded-[20px] text-grayscale-100" : "bg-grayscale-100 rounded-[20px] text-grayscale-900"}`}
        >
            <div
                className={`flex flex-col gap-4 mb-[26px] ${fontClasses.fontHeading} `}
            >
                <h2>장바구니 요약</h2>
                <div
                    className={`${isDarkMode ? "text-purple-light" : "text-purple-default"}`}
                >
                    총 {totalItems}개의 상품이 담겨있습니다.
                </div>
            </div>

            <div className="flex justify-between mb-4">
                <div>전체 금액</div>
                <div>{totalPrice.toLocaleString()}원</div>
            </div>

            <div
                className={`mt-5 p-6 rounded-[14px] ${isDarkMode ? "bg-grayscale-700" : "bg-grayscale-200"}`}
            >
                {cartItems.map((item, index) => (
                    <div key={index}>
                        <div className="flex items-center justify-between">
                            <div className="w-1/2 truncate">{item.name}</div>
                            <div className="w-1/4 text-center">
                                {item.quantity}개
                            </div>
                            <div className="w-1/4 text-right">
                                {item.price.toLocaleString()}원
                            </div>
                        </div>
                        {index !== cartItems.length - 1 && (
                            <div
                                className={`h-[2px] w-full my-4 ${isDarkMode ? "bg-grayscale-800" : "bg-grayscale-300"}`}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CartSummaryComponent;
