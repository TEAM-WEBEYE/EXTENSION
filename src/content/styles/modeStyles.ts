import { modeStyleMap } from "../constants";
import { ModeType } from "../types";

/**
 * 라이트/다크 모드 스타일을 웹 페이지에 적용합니다.
 * @param modeType 적용할 모드 타입
 */
export function applyModeStyle(modeType: ModeType): void {
    const mode = modeStyleMap[modeType];
    if (!mode) return;

    const { backgroundColor, color } = mode;

    const oldStyle = document.getElementById("webeye-mode-style");
    if (oldStyle) oldStyle.remove();

    const style = document.createElement("style");
    style.id = "webeye-mode-style";
    style.textContent = `
        body * {
            color: ${color} !important;
        }

        /* 특정 상호작용 요소는 제외 */
        body *:not(button, select, input[type="checkbox"], input[type="radio"]) {
            background-color: ${backgroundColor} !important;
        }       

        html, body {
            background-color: ${backgroundColor} !important;
            color: ${color} !important;
        }

        a, span, div, p, h1, h2, h3, h4, h5, h6, li, ul, em, strong, td, th, button {
            color: ${color} !important;
            background-color: ${backgroundColor} !important;
            border-color: ${color} !important;
        }

        input, textarea, select {
            background-color: ${backgroundColor} !important;
            color: ${color} !important;
            border: 1px solid ${color} !important;
        }

        img, video {
            filter: brightness(0.8) contrast(1.2);
        }
         
        p, h1, h2, h3, h4, h5, h6, span, div, li {
            overflow-wrap: break-word !important;
            word-wrap: break-word !important;
            hyphens: auto !important;
            text-align: left !important;
            max-width: 100% !important;
            text-overflow: ellipsis !important;
        }
        
       
        body, p, div, span, li, h1, h2, h3, h4, h5, h6 {
            line-height: calc(1.5em + 0.2vw) !important;
            margin-bottom: 0.5em !important;
        }
        
       
        p, li, div.paragraph {
            margin-bottom: 1em !important;
            padding-bottom: 0.5em !important;
        }
    `;
    document.head.appendChild(style);
}
