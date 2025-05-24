import React from "react";
import { createRoot } from "react-dom/client";
import { FoodComponent } from "../../../components/productComponents/foodComponent";

export const observeBreadcrumbFoodAndRender = () => {
    const observer = new MutationObserver(() => {
        const breadcrumbEl = document.querySelector("#breadcrumb");
        if (breadcrumbEl) {
            observer.disconnect();
            checkCategoryFoodAndRender();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
};

export const checkCategoryFoodAndRender = () => {
    const breadcrumbEl = document.querySelector("#breadcrumb");
    if (!breadcrumbEl) return;

    const rawText = breadcrumbEl.textContent || "";
    const cleanedText = rawText.replace(/\s+/g, "");
    console.log("[voim] breadcrumb 내용:", cleanedText);

    const containsOnlyFood =
        cleanedText.includes("식품") && !cleanedText.includes("건강식품");

    if (!containsOnlyFood) {
        console.log("[voim] 식품 단독 카테고리가 아님");
        return;
    }

    if (document.getElementById("voim-food-component")) {
        console.log("[voim] 이미 FoodComponent 렌더링됨");
        return;
    }

    const container = document.createElement("div");
    container.id = "voim-food-component";
    document.body.appendChild(container);

    const root = createRoot(container);
    root.render(<FoodComponent />);
    console.log("[voim] FoodComponent 렌더링 완료");
};
