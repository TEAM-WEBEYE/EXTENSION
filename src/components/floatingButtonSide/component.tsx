import React, { useState } from "react";
import { DetailFloating } from "@src/components/icons/DetailFloating";
import CartFloating from "@src/components/icons/CartFloating";
import { useTheme } from "@src/contexts/ThemeContext";

interface FloatingButtonSideProps {
    onClick: () => void;
    isDetailPage: boolean;
}

export function FloatingButtonSide({
    onClick,
    isDetailPage,
}: FloatingButtonSideProps) {
    const [isSideOpen, setIsSideOpen] = useState(false);
    const { theme } = useTheme();
    const isDarkMode = theme === "dark";
    const handleClick = () => {
        setIsSideOpen((prev) => !prev);
        onClick();
    };

    return (
        <div
            onClick={handleClick}
            role="button"
            aria-haspopup="menu"
            aria-controls="menubar"
            aria-expanded={isSideOpen}
            aria-label="VOIM"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    handleClick();
                }
            }}
            className={`fixed w-[58px] h-[58px] top-[69.5px] left-[1.5px] flex items-center justify-center cursor-pointer z-[9999] transition-all duration-200 ease-in-out hover:scale-105 rounded-[12px] active:hover:opacity-100
                ${isDarkMode ? `bg-purple-light hover:opacity-40 active:bg-purple-default` : `bg-purple-default hover:opacity-40 active:bg-purple-dark `}`}
        >
            {isDetailPage ? (
                <DetailFloating width={32} height={32} />
            ) : (
                <CartFloating width={32} height={32} />
            )}
        </div>
    );
}
