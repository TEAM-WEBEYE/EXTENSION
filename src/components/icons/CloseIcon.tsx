import React from "react";
import { useTheme } from "@src/contexts/ThemeContext";

interface CloseIconProps {
    size?: number;
}

export function CloseIcon({ size = 22 }: CloseIconProps) {
    const { theme } = useTheme();
    const isDarkMode = theme === "dark";
    const strokeColor = isDarkMode ? "#B872FF" : "#8914FF";

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 22 22"
            fill="none"
        >
            <path
                d="M20 2L2 20M20 20L2 2"
                stroke={strokeColor}
                strokeWidth="3"
                strokeLinecap="round"
            />
        </svg>
    );
}
