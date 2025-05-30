import { useTheme } from "@src/contexts/ThemeContext";
import React from "react";

interface BaseFillButtonProps {
    children: React.ReactNode;
    onClick: () => void;
    ariaLabel?: string;
    isDisabled?: boolean;
}

export function BaseFillButton({
    children,
    onClick,
    ariaLabel,
    isDisabled = false,
}: BaseFillButtonProps) {
    const { theme, fontClasses } = useTheme();
    const isDarkMode = theme === "dark";

    return (
        <button
            className={`font-koddi ${fontClasses.fontCommon} py-[16px] px-[30px] relative w-full rounded-[14px]  ${
                isDisabled
                    ? isDarkMode
                        ? "bg-grayscale-400 text-grayscale-100"
                        : " text-grayscale-100  bg-grayscale-600"
                    : isDarkMode
                      ? "bg-purple-light text-grayscale-900 hover:opacity-30 active:bg-purple-dark active:hover:opacity-100"
                      : "text-grayscale-100  bg-purple-default hover:opacity-30 active:bg-purple-dark active:hover:opacity-100"
            }`}
            onClick={onClick}
            aria-label={ariaLabel}
            aria-pressed={isDisabled}
            disabled={isDisabled}
        >
            {children}
        </button>
    );
}
