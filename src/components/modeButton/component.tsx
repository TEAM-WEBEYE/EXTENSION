import React from "react";
import { CheckmarkIcon } from "../checkmarkIcon";
import { useTheme } from "@src/contexts/ThemeContext";

interface ModeButtonProps {
    children: React.ReactNode;
    onClick: () => void;
    isSelected?: boolean;
    modeType: "LIGHT" | "DARK";
}

export function ModeButton({
    children,
    onClick,
    isSelected = false,
    modeType,
}: ModeButtonProps) {
    const { fontClasses } = useTheme();
    const isLightButton = modeType === "LIGHT";
    const isDarkButton = modeType === "DARK";

    return (
        <button
            className={`font-koddi ${fontClasses.fontCommon} py-[16px] px-[30px] relative rounded-[14px] ${
                isSelected
                    ? isLightButton
                        ? "bg-grayscale-100 text-grayscale-900 border-4 border-solid border-purple-default"
                        : "bg-grayscale-900 text-grayscale-100 border-4 border-solid border-purple-light"
                    : isLightButton
                      ? "bg-grayscale-100 text-grayscale-900 hover:opacity-30 border-4 border-solid border-grayscale-300 active:border-purple-default active:hover:opacity-100"
                      : "bg-grayscale-900 text-grayscale-100 hover:opacity-30 border-4 border-solid border-grayscale-700 active:border-purple-light active:hover:opacity-100"
            }`}
            onClick={onClick}
            aria-label={`${typeof children === "string" ? children : "모드"} 선택`}
            aria-pressed={isSelected}
        >
            {children}
            {isSelected && (
                <CheckmarkIcon
                    className="absolute -right-[10px] -top-[10px]"
                    data-testid="checkmark-icon"
                />
            )}
        </button>
    );
}
