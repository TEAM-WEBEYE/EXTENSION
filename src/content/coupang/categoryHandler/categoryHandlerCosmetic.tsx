import React from "react";
import { createRoot } from "react-dom/client";
import { CosmeticComponent } from "@src/components/productComponents/cosmeticComponent";

export const observeBreadcrumbCosmeticAndRender = () => {
    const observer = new MutationObserver(() => {
        const breadcrumbEl = document.querySelector("#breadcrumb");
        if (breadcrumbEl) {
            console.log("[voim] #breadcrumb 발견됨 ");
            observer.disconnect();
            checkCategoryCosmeticAndRender();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    console.log("[voim] breadcrumb 감지 대기 중...");
};

export const checkCategoryCosmeticAndRender = () => {
    const breadcrumbEl = document.querySelector("#breadcrumb");
    if (!breadcrumbEl) {
        console.log("#breadcrumb 엘리먼트를 찾을 수 없음 ");
        return;
    }

    const rawText = breadcrumbEl.textContent || "";
    const cleanedText = rawText.replace(/\s+/g, "");
    console.log("[voim] breadcrumb 내용:", cleanedText);

    const isFoodCategory = cleanedText.includes("뷰티");
    if (!isFoodCategory) {
        console.log("[voim] 뷰티 카테고리가 아님");
        return;
    }

    if (document.getElementById("voim-cosmetic-component")) {
        console.log("[voim] 이미 컴포넌트 렌더링됨");
        return;
    }

    const container = document.createElement("div");
    container.id = "voim-cosmetic-component";
    document.body.appendChild(container);

    const root = createRoot(container);
    root.render(<CosmeticComponent />);
    console.log("[voim] CosmeticComponent 렌더링 완료 ");
};
