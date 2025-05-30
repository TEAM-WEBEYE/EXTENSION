import { modeStyleMap } from "../constants";
import { ModeType } from "../types";

/**
 * 라이트/다크 모드 스타일을 웹 페이지에 적용합니다.
 * @param modeType 적용할 모드 타입
 */
export function applyModeStyle(
    modeType: "SET_MODE_DARK" | "SET_MODE_LIGHT",
): void {
    document.getElementById("voim-mode-style")?.remove();

    if (modeType === "SET_MODE_DARK") {
        const style = document.createElement("style");
        style.id = "voim-mode-style";
        style.textContent = `
            html, body {
                background-color: #121212 !important;
                color: #e0e0e0 !important;
            }

            a, p, span, li, td, th, h1, h2, h3, h4, h5, h6, strong, em, div {
                color: #e0e0e0 !important;
                background-color: transparent !important;
                border-color: #444 !important;
            }

            input, textarea, select, button {
                background-color: #1e1e1e !important;
                color: #ffffff !important;
                border-color: #555 !important;
            }

            img, video, canvas {
                filter: none !important;
            }

            header, nav, form, aside, section, footer {
                background-color: #181818 !important;
                color: #ffffff !important;
                opacity: 1 !important;
                visibility: visible !important;
            }

            [class*="review"],
            [class*="Review"],
            [class*="content"],
            [class*="card"],
            [class*="item"],
            [class*="list"] {
                background-color: #1a1a1a !important;
                color: #e0e0e0 !important;
                border-color: #444 !important;
            }

            /* iframe 내부 Voim 예외 처리 */
            [data-voim-root],
            [data-voim-root] * {
                filter: none !important;
                background-color: initial !important;
                color: initial !important;
                border-color: initial !important;
                box-shadow: none !important;
            }
        `;
        document.head.appendChild(style);
    } else {
        document.getElementById("voim-mode-style")?.remove();
    }
}
