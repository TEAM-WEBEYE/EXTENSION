import { FontStyle } from "../types";
import { applyFontStyleToNode } from "../styles/fontStyles";
import { targetSelectors } from "../constants";
import { STORAGE_KEYS } from "../../background/constants";

/**
 * DOM 변경을 감지하는 MutationObserver를 초기화합니다.
 * @param stylesEnabledCallback 스타일 활성화 상태를 확인하는 콜백
 */
export function initDomObserver(
    stylesEnabledCallback: () => boolean,
): MutationObserver {
    const observer = new MutationObserver((mutations) => {
        chrome.storage.local.get(["stylesEnabled"], (result) => {
            const stylesEnabled =
                result.stylesEnabled !== undefined
                    ? result.stylesEnabled
                    : true;

            if (!stylesEnabled) return;

            chrome.storage.local.get(
                [STORAGE_KEYS.FONT_SIZE, STORAGE_KEYS.FONT_WEIGHT],
                (result) => {
                    const fontSize = result[STORAGE_KEYS.FONT_SIZE];
                    const fontWeight = result[STORAGE_KEYS.FONT_WEIGHT];

                    if (fontSize || fontWeight) {
                        mutations.forEach((mutation) => {
                            if (mutation.addedNodes.length > 0) {
                                const fontStyle: FontStyle = {};
                                if (fontSize) fontStyle.fontSize = fontSize;
                                if (fontWeight)
                                    fontStyle.fontWeight = fontWeight;

                                mutation.addedNodes.forEach((node) => {
                                    applyFontStyleToNode(node, fontStyle);
                                });
                            }

                            if (
                                mutation.type === "attributes" &&
                                mutation.attributeName === "style" &&
                                mutation.target.nodeType === Node.ELEMENT_NODE
                            ) {
                                const element = mutation.target as HTMLElement;
                                const targetMatches = targetSelectors.some(
                                    (selector) => {
                                        try {
                                            return element.matches(selector);
                                        } catch (e) {
                                            return false;
                                        }
                                    },
                                );

                                if (targetMatches) {
                                    const fontStyle: FontStyle = {};
                                    if (fontSize) fontStyle.fontSize = fontSize;
                                    if (fontWeight)
                                        fontStyle.fontWeight = fontWeight;

                                    if (fontStyle.fontSize)
                                        element.style.fontSize =
                                            fontStyle.fontSize;
                                    if (fontStyle.fontWeight)
                                        element.style.fontWeight =
                                            fontStyle.fontWeight;
                                }
                            }
                        });
                    }
                },
            );
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style"],
    });

    return observer;
}
