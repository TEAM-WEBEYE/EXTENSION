import React from "react";
import { useTheme } from "@src/contexts/ThemeContext";

interface RightArrowIconProps {
    size?: number;
}

export function RightArrowIcon({ size = 44 }: RightArrowIconProps) {
    const { theme } = useTheme();
    const isDarkMode = theme === "dark";
    const strokeColor = isDarkMode ? "#FEFEFE" : "#121212";

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 45 44"
            fill="none"
        >
            <path
                d="M16.9993 12.832L26.166 21.9987L16.9993 31.1654"
                stroke={strokeColor}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
