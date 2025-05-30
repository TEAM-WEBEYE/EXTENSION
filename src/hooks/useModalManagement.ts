import { useState, useRef, useCallback } from "react";

export const useModalManagement = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
    const lastSelectedMenuRef = useRef<string | null>(null);
    const menuButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    const handleMenuClick = useCallback(
        (menuId: string) => {
            if (menuId === selectedMenu) {
                setSelectedMenu(null);
            } else {
                setSelectedMenu(menuId);
                lastSelectedMenuRef.current = menuId;
                setTimeout(() => {
                    const panel = document.querySelector('[role="tabpanel"]');
                    if (panel) {
                        (panel as HTMLElement).focus();
                    }
                }, 0);
            }
        },
        [selectedMenu],
    );

    const toggleModal = useCallback(() => {
        setIsModalOpen((prev) => {
            const newState = !prev;
            if (!newState) {
                setSelectedMenu(null);
            }
            if (newState) {
                window.parent.postMessage({ type: "CLOSE_SIDEBAR" }, "*");
            }
            window.parent.postMessage(
                { type: "RESIZE_IFRAME", isOpen: newState },
                "*",
            );
            return newState;
        });
    }, []);

    const toggleSidebar = useCallback(() => {
        setIsSidebarOpen((prev) => {
            const newState = !prev;
            if (newState) {
                setIsModalOpen(false);
                window.parent.postMessage({ type: "CLOSE_MODAL" }, "*");
            }
            window.parent.postMessage(
                { type: "RESIZE_IFRAME", isOpen: newState },
                "*",
            );
            return newState;
        });
    }, [setIsModalOpen]);

    return {
        isModalOpen,
        setIsModalOpen,
        isSidebarOpen,
        setIsSidebarOpen,
        selectedMenu,
        lastSelectedMenuRef,
        menuButtonRefs,
        handleMenuClick,
        toggleModal,
        toggleSidebar,
        setSelectedMenu,
    };
};
