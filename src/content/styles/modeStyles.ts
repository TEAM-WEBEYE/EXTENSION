import { modeStyleMap } from "../constants";
import { ModeType } from "../types";

/**
 * 라이트/다크 모드 스타일을 웹 페이지에 적용합니다.
 * @param modeType 적용할 모드 타입
 */
export function applyModeStyle(modeType: ModeType): void {
    document.getElementById("webeye-mode-style")?.remove();

    if (modeType === "SET_MODE_DARK") {
        document.documentElement.style.filter = "invert(1) hue-rotate(180deg)";
        document.documentElement.style.backgroundColor = "#121212";

        const style = document.createElement("style");
        style.id = "webeye-mode-style";
        style.textContent = `
            img, video, canvas {
                filter: invert(1) hue-rotate(180deg) !important;
            }

            [data-webeye-root], [data-webeye-root] * {
                all: unset !important;
                filter: none !important;
                background-color: initial !important;
                color: initial !important;
                border-color: initial !important;
            }
        `;
        document.head.appendChild(style);
    } else {
        document.documentElement.style.filter = "none";
        document.documentElement.style.backgroundColor = "#fefefe";
    }
}
