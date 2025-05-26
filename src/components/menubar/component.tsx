import React, { useRef, useEffect } from "react";
import { logger } from "@src/utils/logger";
import { useTheme } from "@src/contexts/ThemeContext";

import { BaseButton } from "../baseButton/component";
import { CloseButton } from "../closeButton/component";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const Menubar: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    children,
}) => {
    const { theme, resetSettings } = useTheme();
    const menubarRef = useRef<HTMLDivElement>(null);
    const firstFocusableRef = useRef<HTMLElement | null>(null);
    const lastFocusableRef = useRef<HTMLElement | null>(null);

    const isDarkMode = theme === "dark";

    useEffect(() => {
        if (isOpen && menubarRef.current) {
            const focusableElements = menubarRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            );

            if (focusableElements.length > 0) {
                firstFocusableRef.current = focusableElements[0] as HTMLElement;
                lastFocusableRef.current = focusableElements[
                    focusableElements.length - 1
                ] as HTMLElement;

                firstFocusableRef.current.focus();
            }

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === "Tab") {
                    if (e.shiftKey) {
                        if (
                            document.activeElement === firstFocusableRef.current
                        ) {
                            e.preventDefault();
                            lastFocusableRef.current?.focus();
                        }
                    } else {
                        if (
                            document.activeElement === lastFocusableRef.current
                        ) {
                            e.preventDefault();
                            firstFocusableRef.current?.focus();
                        }
                    }
                } else if (e.key === "Escape") {
                    window.parent.postMessage(
                        { type: "RESIZE_IFRAME", isOpen: false },
                        "*",
                    );
                    onClose();
                }
            };

            menubarRef.current.addEventListener("keydown", handleKeyDown);
            return () => {
                menubarRef.current?.removeEventListener(
                    "keydown",
                    handleKeyDown,
                );
            };
        }
    }, [isOpen, onClose]);

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = document.querySelector(
            '[data-testid="menubar-container"]',
        );
        if (container && !container.contains(e.target as Node)) {
            window.parent.postMessage(
                { type: "RESIZE_IFRAME", isOpen: false },
                "*",
            );
            onClose();
        }
    };

    const handleResetSettings = () => {
        resetSettings();

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

    if (!isOpen) return null;

    return (
        <div
            ref={menubarRef}
            className={`fixed top-0 left-0 w-full h-full flex items-center justify-center z-[10000] bg-black/30 backdrop-blur-[5px] transition-opacity duration-200 ${
                isOpen
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 pointer-events-none"
            }`}
            onClick={handleOverlayClick}
            data-testid="menubar-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="메뉴바"
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
};

export default Menubar;
