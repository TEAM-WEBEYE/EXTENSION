import React, { useState } from "react";
import { getExtensionUrl } from "@src/utils/getExtensionUrl";

interface FloatingButtonProps {
    onClick: () => void;
}

export function FloatingButton({ onClick }: FloatingButtonProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleClick = () => {
        setIsMenuOpen((prev) => !prev);
        onClick();
    };

    return (
        <div
            onClick={handleClick}
            role="button"
            aria-haspopup="menu"
            aria-controls="menubar"
            aria-expanded={isMenuOpen}
            aria-label="VOIM"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    handleClick();
                }
            }}
            className="fixed w-[58px] h-[58px] top-[1.5px] left-[1.5px] flex items-center justify-center cursor-pointer z-[9999] transition-all duration-200 ease-in-out hover:scale-105"
        >
            <img
                src={getExtensionUrl("icon.png")}
                alt="VOIM 익스텐션"
                aria-hidden="true"
                className="w-full h-full max-w-[58px] max-h-[58px] object-contain"
            />
        </div>
    );
}
