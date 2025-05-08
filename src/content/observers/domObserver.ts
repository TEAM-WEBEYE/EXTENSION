import { FontStyle, UserSettings } from "../types";
import { applyFontStyleToNode } from "../styles/fontStyles";
import { targetSelectors } from "../constants";

/**
 * DOM 변경을 감지하는 MutationObserver를 초기화합니다.
 * @param stylesEnabledCallback 스타일 활성화 상태를 확인하는 콜백
 */
export function initDomObserver(
    stylesEnabledCallback: () => boolean,
): MutationObserver {
    const observer = new MutationObserver((mutations) => {
        chrome.storage.sync.get(["stylesEnabled"], (result) => {
            const stylesEnabled =
                result.stylesEnabled !== undefined
                    ? result.stylesEnabled
                    : true;

            if (!stylesEnabled) return;

            chrome.storage.sync.get(["userSettings"], (result) => {
                const settings: UserSettings = result.userSettings || {};

                if (settings.fontSize || settings.fontWeight) {
                    mutations.forEach((mutation) => {
                        if (mutation.addedNodes.length > 0) {
                            const fontStyle: FontStyle = {};
                            if (settings.fontSize)
                                fontStyle.fontSize = settings.fontSize;
                            if (settings.fontWeight)
                                fontStyle.fontWeight = settings.fontWeight;

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
                                if (settings.fontSize)
                                    fontStyle.fontSize = settings.fontSize;
                                if (settings.fontWeight)
                                    fontStyle.fontWeight = settings.fontWeight;

                                if (fontStyle.fontSize)
                                    element.style.fontSize = fontStyle.fontSize;
                                if (fontStyle.fontWeight)
                                    element.style.fontWeight =
                                        fontStyle.fontWeight;
                            }
                        }
                    });
                }
            });
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
