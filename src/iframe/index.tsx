import React from "react";
import { createRoot } from "react-dom/client";
import App from "./iframe";
import { logger } from "@src/utils/logger";
import { AppThemeProvider } from "@src/contexts/ThemeContext";
import { CursorProvider } from "@src/contexts/CursorContext";

const container = document.getElementById("root");

if (container) {
    const root = createRoot(container);
    root.render(
        <AppThemeProvider>
            <CursorProvider>
                <App />
            </CursorProvider>
        </AppThemeProvider>,
    );
} else {
    logger.error("Root container를 찾을 수 없습니다.");
}
