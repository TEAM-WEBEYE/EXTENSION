/**
 * 커스텀 커서 스타일을 웹 페이지에 적용합니다.
 * @param cursorUrl 커서 이미지 URL
 */
export function applyCursorStyle(cursorUrl: string): void {
    try {
        const existingStyle = document.getElementById("custom-cursor-style");
        if (existingStyle) {
            document.head.removeChild(existingStyle);
        }

        const styleElement = document.createElement("style");
        styleElement.id = "custom-cursor-style";
        styleElement.textContent = `
            body, button, a, input, select, textarea {
                cursor: url('${cursorUrl}'), auto !important;
            }
        `;
        document.head.appendChild(styleElement);

        applyStyleToIframes(styleElement.textContent);
    } catch (error) {
        console.error("커서 스타일 적용 중 오류:", error);
    }
}

/**
 * 커서 스타일을 제거합니다.
 */
export function removeCursorStyle(): void {
    const existingStyle = document.getElementById("custom-cursor-style");
    if (existingStyle) {
        document.head.removeChild(existingStyle);
    }

    removeStyleFromIframes();
}

/**
 * iframe 내부에도 스타일을 적용합니다.
 * @param styleContent 적용할 스타일 내용
 */
export function applyStyleToIframes(styleContent: string): void {
    const iframes = document.querySelectorAll("iframe");
    iframes.forEach((iframe) => {
        try {
            const iframeDoc =
                iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) {
                const existingIframeStyle = iframeDoc.getElementById(
                    "custom-cursor-style",
                );
                if (existingIframeStyle) {
                    iframeDoc.head.removeChild(existingIframeStyle);
                }
                const iframeStyle = iframeDoc.createElement("style");
                iframeStyle.id = "custom-cursor-style";
                iframeStyle.textContent = styleContent;
                iframeDoc.head.appendChild(iframeStyle);
            }
        } catch (e) {
            console.warn(e);
        }
    });
}

/**
 * iframe 내부의 스타일을 제거합니다.
 */
export function removeStyleFromIframes(): void {
    const iframes = document.querySelectorAll("iframe");

    iframes.forEach((iframe) => {
        try {
            const iframeDoc = iframe.contentDocument;

            if (iframeDoc) {
                const existingIframeStyle = iframeDoc.getElementById(
                    "custom-cursor-style",
                );
                if (existingIframeStyle) {
                    iframeDoc.head.removeChild(existingIframeStyle);
                }
            }
        } catch (e) {
            console.warn(e);
        }
    });
}
