import { useEffect, useRef } from "react";
import { menuItems } from "@src/constants/menuItems";

const focusMenuButton = (menuId: string) => {
    const menuButtons = document.querySelectorAll(
        '[data-testid="menubar-content"] button',
    );
    const currentMenuButton = Array.from(menuButtons).find((button) =>
        button.getAttribute("aria-label")?.includes(menuId || ""),
    );
    if (currentMenuButton) {
        (currentMenuButton as HTMLElement).focus();
    }
};

const focusNextMenuButton = (menuId: string) => {
    const menuButtons = document.querySelectorAll(
        '[data-testid="menubar-content"] button',
    );
    const currentIndex = menuItems.findIndex((item) => item.id === menuId);
    if (currentIndex !== -1) {
        if (currentIndex < menuItems.length - 1) {
            const nextButton = menuButtons[currentIndex + 1] as HTMLElement;
            if (nextButton) {
                nextButton.focus();
            }
        } else {
            const resetButton = document.querySelector(
                '[data-testid="reset-button"]',
            ) as HTMLElement;
            if (resetButton) {
                resetButton.focus();
            }
        }
    }
};

export const useFocusManagement = (
    menuId: string | null,
    panelRef: React.RefObject<HTMLDivElement>,
) => {
    const firstFocusableRef = useRef<HTMLElement | null>(null);
    const lastFocusableRef = useRef<HTMLElement | null>(null);
    const isPanelFocused = useRef(false);
    const hasLeftPanel = useRef(false);

    useEffect(() => {
        if (menuId && panelRef.current) {
            const handleFocus = () => {
                if (hasLeftPanel.current) {
                    const menuButtons = document.querySelectorAll(
                        '[data-testid="menubar-content"] button',
                    );
                    const currentMenuButton = Array.from(menuButtons).find(
                        (button) =>
                            button
                                .getAttribute("aria-label")
                                ?.includes(menuId || ""),
                    );
                    if (currentMenuButton) {
                        (currentMenuButton as HTMLElement).focus();
                    }
                    return;
                }
                isPanelFocused.current = true;
            };

            const handleBlur = (e: FocusEvent) => {
                if (panelRef.current?.contains(e.relatedTarget as Node)) {
                    return;
                }
                isPanelFocused.current = false;
                hasLeftPanel.current = true;
            };

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === "Tab") {
                    if (e.shiftKey) {
                        if (
                            document.activeElement === firstFocusableRef.current
                        ) {
                            e.preventDefault();
                            focusMenuButton(menuId);
                            isPanelFocused.current = false;
                            hasLeftPanel.current = true;
                        }
                    } else {
                        if (
                            document.activeElement === lastFocusableRef.current
                        ) {
                            e.preventDefault();
                            focusNextMenuButton(menuId);
                            isPanelFocused.current = false;
                            hasLeftPanel.current = true;
                        }
                    }
                }
            };

            panelRef.current.addEventListener("focus", handleFocus);
            panelRef.current.addEventListener("blur", handleBlur);
            panelRef.current.addEventListener("keydown", handleKeyDown);

            const focusableElements = panelRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            );

            if (focusableElements.length > 0) {
                firstFocusableRef.current = focusableElements[0] as HTMLElement;
                lastFocusableRef.current = focusableElements[
                    focusableElements.length - 1
                ] as HTMLElement;

                firstFocusableRef.current.focus();
                isPanelFocused.current = true;
                hasLeftPanel.current = false;
            }

            return () => {
                panelRef.current?.removeEventListener("keydown", handleKeyDown);
                panelRef.current?.removeEventListener("focus", handleFocus);
                panelRef.current?.removeEventListener("blur", handleBlur);
            };
        }
    }, [menuId]);

    useEffect(() => {
        const handleMenuKeyDown = (e: Event) => {
            const keyboardEvent = e as KeyboardEvent;
            if (keyboardEvent.key === "Tab" && !keyboardEvent.shiftKey) {
                const menuButtons = document.querySelectorAll(
                    '[data-testid="menubar-content"] button',
                );
                const currentButton = keyboardEvent.target as HTMLElement;
                const currentIndex =
                    Array.from(menuButtons).indexOf(currentButton);

                if (currentIndex === menuButtons.length - 1) {
                    keyboardEvent.preventDefault();
                    const resetButton = document.querySelector(
                        '[data-testid="reset-button"]',
                    ) as HTMLElement;
                    if (resetButton) {
                        resetButton.focus();
                    }
                }
            }
        };

        const menuButtons = document.querySelectorAll(
            '[data-testid="menubar-content"] button',
        );
        menuButtons.forEach((button) => {
            button.addEventListener("keydown", handleMenuKeyDown);
        });

        return () => {
            menuButtons.forEach((button) => {
                button.removeEventListener("keydown", handleMenuKeyDown);
            });
        };
    }, []);

    return { firstFocusableRef, lastFocusableRef, isPanelFocused };
};
