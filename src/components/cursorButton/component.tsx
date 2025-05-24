import React from "react";
import { useTheme } from "@src/contexts/ThemeContext";
import { getExtensionUrl } from "@src/utils/getExtensionUrl";
import { CheckmarkIcon } from "../checkmarkIcon";

interface CursorButtonProps {
    onClick: () => void;
    color?: "white" | "purple" | "yellow" | "mint" | "pink" | "black";
    size?: "small" | "medium" | "large";
    isSelected?: boolean;
}

export function CursorButton({
    onClick,
    color = "white",
    size = "medium",
    isSelected = false,
}: CursorButtonProps) {
    const { theme } = useTheme();
    const isDarkMode = theme === "dark";

    const fileName = `cursors/${color}_${size}.png`;

    return (
        <button
            className={`flex items-center justify-center w-[140px] h-[140px] rounded-[20px] relative ${
                isSelected
                    ? isDarkMode
                        ? "bg-grayscale-800 border-4 border-solid border-purple-light"
                        : "bg-grayscale-100 border-4 border-solid border-purple-default"
                    : isDarkMode
                      ? "bg-grayscale-800 hover:opacity-30 border-4 border-solid border-grayscale-700"
                      : "bg-grayscale-100 hover:opacity-30 border-4 border-solid border-grayscale-300"
            }`}
            onClick={onClick}
            aria-label={`커서 변경 버튼: ${size}, ${color}`}
        >
            <img
                src={getExtensionUrl(fileName)}
                alt={`커서: ${size}, ${color}`}
            />
            {isSelected && (
                <CheckmarkIcon className="absolute -right-[10px] -top-[10px]" />
            )}
        </button>
    );
}
