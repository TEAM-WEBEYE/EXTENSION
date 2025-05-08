import React from "react";
import { useAppTheme } from "@src/contexts/ThemeContext";
import { CheckmarkIcon } from "../checkmarkIcon";

interface MenubarButtonProps {
    isSelected: boolean;
    text: string;
    ariaLabel: string;
    onClick?: () => void;
}

export function MenubarButton({
    isSelected,
    text,
    onClick,
    ariaLabel,
}: MenubarButtonProps): JSX.Element {
    const { theme, fontClasses } = useAppTheme();
    const isDarkMode = theme === "dark";

    return (
        <button
            onClick={onClick}
            className={`${fontClasses.fontHeading} font-koddi flex items-center justify-between rounded-[14px] w-[420px] h-[88px] p-5 
                ${
                    isSelected
                        ? isDarkMode
                            ? "bg-grayscale-900 text-grayscale-100 border-4 border-solid border-purple-light"
                            : "bg-grayscale-100 text-grayscale-900 border-4 border-solid border-purple-default"
                        : isDarkMode
                          ? "bg-grayscale-900 text-grayscale-100 hover:opacity-30"
                          : "bg-grayscale-100 text-grayscale-900 hover:opacity-30"
                }`}
            role="menuitem"
            aria-label={ariaLabel}
            tabIndex={0}
            aria-selected={isSelected}
            aria-controls="menubar"
            aria-haspopup="menu"
        >
            {text}
            {isSelected && <CheckmarkIcon data-testid="checkmark-icon" />}
        </button>
    );
}
