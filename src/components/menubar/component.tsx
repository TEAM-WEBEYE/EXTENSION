import React from "react";
import { logger } from "@src/utils/logger";
import { useAppTheme } from "@src/contexts/ThemeContext";
import { useCursorTheme } from "@src/contexts/CursorContext";
import { BaseButton } from "../baseButton/component";
import { CloseButton } from "../closeButton/component";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export function Menubar({ isOpen, onClose, children }: ModalProps) {
    const { theme, resetSettings } = useAppTheme();
    const { resetCursorSettings } = useCursorTheme();
    const isDarkMode = theme === "dark";

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = document.querySelector(
            '[data-testid="menubar-container"]',
        );
        if (container && !container.contains(e.target as Node)) {
            onClose();
        }
    };

    const handleResetSettings = () => {
        resetSettings();
        resetCursorSettings();

        chrome.runtime
            .sendMessage({ type: "RESET_SETTINGS" })
            .then((response) => {
                if (response && response.success) {
                    logger.debug("모든 설정이 초기화되었습니다.");
                }
            })
            .catch((error) => {
                logger.error("메시지 전송 중 오류:", error);
            });
    };

    return (
        <div
            className={`fixed top-0 left-0 w-full h-full flex items-center justify-center z-[10000] bg-black/30 backdrop-blur-[5px] transition-opacity duration-200 ${
                isOpen
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 pointer-events-none"
            }`}
            onClick={handleOverlayClick}
            data-testid="menubar-overlay"
        >
            <div
                className={`${
                    isDarkMode ? `bg-grayscale-900` : `bg-grayscale-100`
                } fixed top-[70px] right-[20px] rounded-[30px] w-[460px] p-5 overflow-y-auto shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] font-koddi`}
                data-testid="menubar-container"
            >
                <div className="flex justify-between mb-6 font-24-Bold">
                    <BaseButton onClick={handleResetSettings}>
                        설정 초기화
                    </BaseButton>

                    <CloseButton onClick={onClose} />
                </div>

                <div
                    className="flex flex-col gap-5"
                    data-testid="menubar-content"
                >
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Menubar;
