import React from "react";
import { useTheme } from "@src/contexts/ThemeContext";

interface LeftArrowIconProps {
    size?: number;
}

export function LeftArrowIcon({ size = 44 }: LeftArrowIconProps) {
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
                d="M28.0007 31.168L18.834 22.0013L28.0007 12.8346"
                stroke={strokeColor}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
