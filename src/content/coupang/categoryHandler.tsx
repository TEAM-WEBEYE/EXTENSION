import React from "react";
import { createRoot } from "react-dom/client";
import { FoodComponent } from "../../components/productComponents/foodComponent";

export const checkCategoryAndRender = () => {
    const breadcrumbEl = document.querySelector("#breadcrumb");
    if (!breadcrumbEl) {
        console.log("#breadcrumb 엘리먼트를 찾을 수 없음");
        return;
    }

    const rawText = breadcrumbEl.textContent || "";
    console.log("원본 breadcrumb textContent:", rawText);

    const cleanedText = rawText.replace(/\s+/g, "");
    console.log("공백 제거된 breadcrumb 텍스트:", cleanedText);

    const isFoodCategory = cleanedText.includes("식품");

    if (!isFoodCategory) {
        return;
    }

    if (document.getElementById("voim-food-component")) {
        return;
    }
    const container = document.createElement("div");
    container.id = "webeye-food-component";
    document.body.appendChild(container);

    const root = createRoot(container);
    root.render(<FoodComponent />);
};
