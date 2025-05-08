import { FontStyle } from "../types";
import { targetSelectors } from "../constants";

/**
 * 폰트 스타일을 웹 페이지의 요소들에 적용합니다.
 * @param style 적용할 폰트 스타일 객체
 */
export function applyFontStyle(style: FontStyle): void {
    // 1. 선택자 기반 스타일 적용
    const elements = document.querySelectorAll(targetSelectors.join(","));
    elements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (style.fontSize) htmlEl.style.fontSize = style.fontSize;
        if (style.fontWeight) htmlEl.style.fontWeight = style.fontWeight;
    });

    // 2. 글로벌 스타일 적용을 위한 스타일 시트
    const existingGlobalStyle = document.getElementById(
        "webeye-global-font-style",
    );
    if (existingGlobalStyle) {
        document.head.removeChild(existingGlobalStyle);
    }

    // 글로벌 스타일 시트 추가
    if (style.fontSize || style.fontWeight) {
        const globalStyle = document.createElement("style");
        globalStyle.id = "webeye-global-font-style";

        let cssText = "";

        if (style.fontSize) {
            cssText += `
                ${targetSelectors.join(", ")} {
                    font-size: ${style.fontSize} !important;
                }
            `;
        }

        if (style.fontWeight) {
            cssText += `
                ${targetSelectors.join(", ")} {
                    font-weight: ${style.fontWeight} !important;
                }
            `;
        }

        globalStyle.textContent = cssText;
        document.head.appendChild(globalStyle);
    }
}

/**
 * 특정 노드에 폰트 스타일을 적용합니다.
 * MutationObserver와 함께 사용하기 위한 함수입니다.
 * @param node 스타일을 적용할 노드
 * @param style 적용할 폰트 스타일 객체
 */
export function applyFontStyleToNode(node: Node, style: FontStyle): void {
    if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (style.fontSize) element.style.fontSize = style.fontSize;
        if (style.fontWeight) element.style.fontWeight = style.fontWeight;

        const childElements = element.querySelectorAll(
            targetSelectors.join(","),
        );
        childElements.forEach((childEl) => {
            const htmlChildEl = childEl as HTMLElement;
            if (style.fontSize) htmlChildEl.style.fontSize = style.fontSize;
            if (style.fontWeight)
                htmlChildEl.style.fontWeight = style.fontWeight;
        });
    }
}
