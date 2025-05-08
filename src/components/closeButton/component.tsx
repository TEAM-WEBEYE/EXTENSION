import { useAppTheme } from "@src/contexts/ThemeContext";
import React from "react";

interface CloseButtonProps {
    onClick: () => void;
    ariaLabel?: string;
}

export function CloseButton({ onClick, ariaLabel = "닫기" }: CloseButtonProps) {
    const { theme } = useAppTheme();
    const isDarkMode = theme === "dark";

    const strokeColor = isDarkMode ? "#FEFEFE" : "#121212";

    return (
        <button
            className={` p-[16px] relative rounded-[14px] ${
                isDarkMode
                    ? "bg-grayscale-900  hover:opacity-30 border-4 border-solid border-grayscale-700 active:border-purple-light active:hover:opacity-100"
                    : "bg-grayscale-100 hover:opacity-30 border-4 border-solid border-grayscale-300 active:border-purple-default active:hover:opacity-100"
            }`}
            onClick={onClick}
            aria-label={ariaLabel}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 36 36"
                fill="none"
            >
                <path
                    d="M27 8.99805L9 26.998M27 26.998L9 8.99805"
                    stroke={strokeColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                />
            </svg>
        </button>
    );
}
