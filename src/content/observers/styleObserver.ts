import { UserSettings, FontStyle } from "../types";
import { targetSelectors } from "../constants";

export const createStyleObserver = () => {
    return new MutationObserver((mutations) => {
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
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                const element = node as HTMLElement;
                                if (settings.fontSize)
                                    element.style.fontSize = settings.fontSize;
                                if (settings.fontWeight)
                                    element.style.fontWeight =
                                        settings.fontWeight;

                                const childElements = element.querySelectorAll(
                                    targetSelectors.join(","),
                                );
                                childElements.forEach((childEl) => {
                                    const htmlChildEl = childEl as HTMLElement;
                                    if (settings.fontSize)
                                        htmlChildEl.style.fontSize =
                                            settings.fontSize;
                                    if (settings.fontWeight)
                                        htmlChildEl.style.fontWeight =
                                            settings.fontWeight;
                                });
                            }
                        });
                    }
                });
            }
        });
    });
};
