import React, { forwardRef } from "react";
import { useTheme } from "@src/contexts/ThemeContext";
import { CheckmarkIcon } from "../icons";

interface MenubarButtonProps {
    isSelected: boolean;
    text: string;
    ariaLabel: string;
    onClick?: () => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
}

export const MenubarButton = forwardRef<HTMLButtonElement, MenubarButtonProps>(
    ({ isSelected, text, onClick, onKeyDown, ariaLabel }, ref) => {
        const { theme, fontClasses } = useTheme();
        const isDarkMode = theme === "dark";

        return (
            <button
                ref={ref}
                onClick={onClick}
                onKeyDown={onKeyDown}
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
                aria-selected={isSelected}
                aria-expanded={isSelected}
            >
                {text}
                {isSelected && <CheckmarkIcon data-testid="checkmark-icon" />}
            </button>
        );
    },
);

MenubarButton.displayName = "MenubarButton";
