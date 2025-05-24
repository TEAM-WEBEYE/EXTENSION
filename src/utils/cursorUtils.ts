import { getExtensionUrl } from "@src/utils/getExtensionUrl";
import type { CursorTheme, CursorSize } from "@src/contexts/ThemeContext";

export const cursorImages: Record<CursorTheme, Record<CursorSize, string>> = {
    white: {
        small: "cursors/white_small.png",
        medium: "cursors/white_medium.png",
        large: "cursors/white_large.png",
    },
    purple: {
        small: "cursors/purple_small.png",
        medium: "cursors/purple_medium.png",
        large: "cursors/purple_large.png",
    },
    yellow: {
        small: "cursors/yellow_small.png",
        medium: "cursors/yellow_medium.png",
        large: "cursors/yellow_large.png",
    },
    mint: {
        small: "cursors/mint_small.png",
        medium: "cursors/mint_medium.png",
        large: "cursors/mint_large.png",
    },
    pink: {
        small: "cursors/pink_small.png",
        medium: "cursors/pink_medium.png",
        large: "cursors/pink_large.png",
    },
    black: {
        small: "cursors/black_small.png",
        medium: "cursors/black_medium.png",
        large: "cursors/black_large.png",
    },
};

export function applyCursorStyle(
    theme: CursorTheme,
    size: CursorSize,
    enabled: boolean,
) {
    const styleId = "custom-cursor-style";
    const cursorUrl = getExtensionUrl(cursorImages[theme][size]);

    const styleContent = enabled
        ? `body, button, a, input, select, textarea { cursor: url('${cursorUrl}'), auto !important; }`
        : "";

    const updateStyleInDocument = (doc: Document) => {
        const existing = doc.getElementById(styleId);
        if (existing) existing.remove();

        if (enabled) {
            const style = doc.createElement("style");
            style.id = styleId;
            style.textContent = styleContent;
            doc.head.appendChild(style);
        }
    };

    updateStyleInDocument(document);
    document.querySelectorAll("iframe").forEach((iframe) => {
        try {
            const iframeDoc =
                iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) updateStyleInDocument(iframeDoc);
        } catch (e) {
            console.warn("iframe 커서 적용 실패:", e);
        }
    });
}
