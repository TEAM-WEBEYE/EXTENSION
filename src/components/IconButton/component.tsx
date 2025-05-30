import { useTheme } from "@src/contexts/ThemeContext";
import React, { ReactNode } from "react";

interface IconButtonProps {
    onClick: () => void;
    ariaLabel?: string;
    children: ReactNode;
}

export function IconButton({ onClick, ariaLabel, children }: IconButtonProps) {
    const { theme } = useTheme();
    const isDarkMode = theme === "dark";

    return (
        <button
            className={`p-[16px] relative rounded-[14px] ${
                isDarkMode
                    ? "bg-grayscale-900 hover:opacity-30 border-4 border-solid border-grayscale-700 active:border-purple-light active:hover:opacity-100"
                    : "bg-grayscale-100 hover:opacity-30 border-4 border-solid border-grayscale-300 active:border-purple-default active:hover:opacity-100"
            }`}
            onClick={onClick}
            aria-label={ariaLabel}
        >
            {children}
        </button>
    );
}
