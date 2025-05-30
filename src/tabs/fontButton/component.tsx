import React from "react";
import { CheckmarkIcon } from "@src/components/icons";
import { useTheme } from "@src/contexts/ThemeContext";

interface FontButtonProps {
    children: React.ReactNode;
    onClick: () => void;
    isSelected?: boolean;
    fontType?: "weight" | "size"; // 폰트 유형 (두께 또는 크기)
}

export function FontButton({
    children,
    onClick,
    isSelected = false,
    fontType = "weight",
}: FontButtonProps) {
    const { theme, fontClasses } = useTheme();
    const isDarkMode = theme === "dark";

    // 폰트 두께 또는 크기에 대한 스타일 매핑
    const getFontStyle = () => {
        if (fontType === "weight") {
            // 폰트 두께 매핑
            if (children === "얇게") return { fontWeight: "400" };
            if (children === "기본") return { fontWeight: "700" };
            if (children === "두껍게") return { fontWeight: "800" };
        } else if (fontType === "size") {
            // 폰트 크기 매핑
            if (children === "아주 작게") return { fontSize: "20px" };
            if (children === "작게") return { fontSize: "22px" };
            if (children === "기본") return { fontSize: "24px" };
            if (children === "크게") return { fontSize: "26px" };
            if (children === "아주 크게") return { fontSize: "28px" };
        }

        return {}; // 기본값
    };

    const fontStyle = getFontStyle();

    return (
        <button
            type="button"
            className={`font-koddi ${
                fontClasses.fontCommon
            } py-[16px] px-[30px] relative rounded-[14px] ${
                isSelected
                    ? isDarkMode
                        ? "bg-grayscale-900 text-grayscale-100 border-4 border-solid border-purple-light"
                        : "bg-grayscale-100 text-grayscale-900 border-4 border-solid border-purple-default"
                    : isDarkMode
                      ? "bg-grayscale-900 text-grayscale-100 hover:opacity-30 border-4 border-solid border-grayscale-700 active:border-purple-light active:hover:opacity-100"
                      : "bg-grayscale-100 text-grayscale-900 hover:opacity-30 border-4 border-solid border-grayscale-300 active:border-purple-default active:hover:opacity-100"
            }`}
            onClick={onClick}
            aria-label={`${
                typeof children === "string" ? children : "옵션"
            } 선택`}
            aria-pressed={isSelected}
            style={fontStyle}
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
