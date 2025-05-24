import React from "react";
import { createRoot } from "react-dom/client";
import { InfoComponent } from "../../components/productComponents/infoComponent";

export const renderInfoComponent = () => {
    if (!window.location.hostname.includes("coupang.com")) {
        return;
    }

    console.log("[voim] Info 컴포넌트 렌더링 시작");

    if (document.getElementById("voim-info-component")) {
        console.log("[voim] 이미 Info 컴포넌트가 렌더링되어 있음");
        return;
    }

    // 페이지 로드 완료 대기
    const waitForMainSection = () => {
        const mainSection = document.querySelector(".prod-atf-main");
        if (mainSection) {
            const container = document.createElement("div");
            container.id = "voim-info-component";
            container.style.position = "relative";
            container.style.marginTop = "20px";
            container.style.marginBottom = "20px";
            container.style.zIndex = "9999";

            mainSection.parentNode?.insertBefore(
                container,
                mainSection.nextSibling,
            );
            const root = createRoot(container);
            root.render(<InfoComponent />);
            console.log("[voim] Info 컴포넌트 렌더링 완료");
        } else {
            console.log("[voim] 상품 상세 섹션 대기 중...");
            setTimeout(waitForMainSection, 500); // 0.5초마다 재시도
        }
    };

    const observer = new MutationObserver((mutations, obs) => {
        const mainSection = document.querySelector(".prod-atf-main");
        if (mainSection) {
            obs.disconnect(); // 관찰 중지
            waitForMainSection();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    setTimeout(() => {
        observer.disconnect();
        console.error("[voim] 상품 상세 섹션을 찾을 수 없습니다.");
    }, 10000);
};
