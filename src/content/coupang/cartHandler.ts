interface CartItem {
    name: string;
    quantity: number;
    price: number;
    originalPrice: number;
    discountRate: number;
}

export const extractCartItems = (): CartItem[] => {
    const cartItems: CartItem[] = [];
    const cartItemElements = document.querySelectorAll(
        ".cart-deal-item, [data-sentry-component='ProductUnit']",
    );

    cartItemElements.forEach((item) => {
        const nameElement =
            item.querySelector("#name") || item.querySelector(".product-name");
        const quantityInput = (item.querySelector(".cart-quantity-input") ||
            item.querySelector(".quantity-input")) as HTMLInputElement;
        const priceElement =
            item.querySelector("[data-id='sale-price-ccid']") ||
            item.querySelector(".unit-total-sale-price");
        const originalPriceElement =
            item.querySelector("[data-id='anchor-price']") ||
            item.querySelector(".anchor-price");
        const discountRateElement =
            item.querySelector("[data-id='discount-rate-gte10']") ||
            item.querySelector(".discount-rate span");

        if (nameElement && quantityInput && priceElement) {
            const name =
                nameElement.textContent?.trim().replace(/삭제$/, "") || "";
            const quantity = parseInt(quantityInput.value) || 1;
            const price = parseInt(
                priceElement.textContent?.replace(/[^0-9]/g, "") || "0",
            );
            const originalPrice = parseInt(
                originalPriceElement?.textContent?.replace(/[^0-9]/g, "") ||
                    "0",
            );
            const discountRate = parseInt(
                discountRateElement?.textContent?.replace(/[^0-9]/g, "") || "0",
            );

            cartItems.push({
                name,
                quantity,
                price,
                originalPrice,
                discountRate,
            });
        }
    });

    return cartItems;
};

export const sendCartItemsToBackground = () => {
    const cartItems = extractCartItems();

    chrome.runtime.sendMessage({
        type: "CART_ITEMS_UPDATED",
        data: cartItems,
    });
};
