import "../src/css/app.css";
import React from "react";
import { AppThemeContext } from "../src/contexts/ThemeContext.tsx";

const preview = {
    decorators: [
        (StoryFn) => (
            <AppThemeContext.Provider>
                <StoryFn />
            </AppThemeContext.Provider>
        ),
    ],
};

export default preview;
