import React from "react";
import { createRoot } from "react-dom/client";
import { HealthComponent } from "@src/components/productComponents/healthComponent";

export const observeBreadcrumbHealthAndRender = () => {
    const observer = new MutationObserver(() => {
        const breadcrumbEl = document.querySelector("#breadcrumb");
        if (breadcrumbEl) {
            console.log("[voim] #breadcrumb 발견됨 ");
            observer.disconnect();
            checkCategoryHealthAndRender();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    console.log("[voim] breadcrumb 감지 대기 중...");
};

export const checkCategoryHealthAndRender = () => {
    const breadcrumbEl = document.querySelector("#breadcrumb");
    if (!breadcrumbEl) {
        console.log("#breadcrumb 엘리먼트를 찾을 수 없음 ");
        return;
    }

    const rawText = breadcrumbEl.textContent || "";
    const cleanedText = rawText.replace(/\s+/g, "");
    console.log("[voim] breadcrumb 내용:", cleanedText);

    const isFoodCategory = cleanedText.includes("헬스/건강식품");
    if (!isFoodCategory) {
        console.log("[voim] 헬스 카테고리가 아님");
        return;
    }

    if (document.getElementById("voim-health-component")) {
        console.log("[voim] 이미 컴포넌트 렌더링됨");
        return;
    }

    const container = document.createElement("div");
    container.id = "voim-health-component";
    document.body.appendChild(container);

    const root = createRoot(container);
    root.render(<HealthComponent />);
    console.log("[voim] HealthComponent 렌더링 완료 ");
};
