import React from "react";
import { createRoot } from "react-dom/client";
import App from "./iframe";
import { logger } from "@src/utils/logger";
import { ThemeContextProvider } from "@src/contexts/ThemeContext";

const container = document.getElementById("root");

if (container) {
    const root = createRoot(container);
    root.render(
        <ThemeContextProvider>
            <App />
        </ThemeContextProvider>,
    );
} else {
    logger.error("Root container를 찾을 수 없습니다.");
}
