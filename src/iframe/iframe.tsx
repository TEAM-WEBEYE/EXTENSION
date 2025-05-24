import React, { useEffect, useRef, useState } from "react";

import { FloatingButton } from "@src/components/floatingButton";
import { Menubar } from "@src/components/menubar";
import { MenubarButton } from "@src/components/menubarButton";
import { useTheme } from "@src/contexts/ThemeContext";
import { CursorTab } from "@src/components/cursorTab";
import { ShortcutTab } from "@src/components/shortcutTab";
import ControlMode from "@src/components/modeButton/ControlMode";
import ControlFont from "@src/components/fontButton/ControlFont";
import { MyInfo } from "@src/tabs/myInfo";
import ControlService from "@src/components/serviceButton/ControlService";
import { Onboarding } from "@src/tabs/myInfo/components";

import "../css/app.css";
import { useUserInfo } from "@src/hooks/useUserInfo";

interface PanelContentProps {
    menuId: string | null;
}

const PanelContent: React.FC<PanelContentProps> = ({ menuId }) => {
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (menuId && panelRef.current) {
            panelRef.current.focus();
        }
    }, [menuId]);

    switch (menuId) {
        case "high-contrast":
            return (
                <div
                    ref={panelRef}
                    tabIndex={-1}
                    role="tabpanel"
                    aria-label="고대비 화면 설정"
                >
                    <ControlMode />
                </div>
            );
        case "cursor":
            return (
                <div
                    ref={panelRef}
                    tabIndex={-1}
                    role="tabpanel"
                    aria-label="마우스 커서 설정"
                >
                    <CursorTab />
                </div>
            );
        case "font":
            return (
                <div
                    ref={panelRef}
                    tabIndex={-1}
                    role="tabpanel"
                    aria-label="글자 설정"
                >
                    <ControlFont />
                </div>
            );
        case "shortcut":
            return (
                <div
                    ref={panelRef}
                    tabIndex={-1}
                    role="tabpanel"
                    aria-label="단축키 안내"
                >
                    <ShortcutTab />
                </div>
            );
        case "my-info":
            return (
                <div
                    ref={panelRef}
                    tabIndex={-1}
                    role="tabpanel"
                    aria-label="내 정보 설정"
                >
                    <MyInfo />
                </div>
            );
        case "service":
            return (
                <div
                    ref={panelRef}
                    tabIndex={-1}
                    role="tabpanel"
                    aria-label="서비스 설정"
                >
                    <ControlService />
                </div>
            );
        default:
            return null;
    }
};

const menuItems = [
    { id: "high-contrast", text: "고대비 화면 사용하기" },
    { id: "cursor", text: "마우스 커서 설정하기" },
    { id: "font", text: "글자 설정하기" },
    { id: "shortcut", text: "단축키 안내 보기" },
    { id: "my-info", text: "내 정보 설정하기" },
    { id: "service", text: "서비스 설정하기" },
];

const App = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
    const [isOnboarding, setIsOnboarding] = useState(false);
    const [showUserInfo, setShowUserInfo] = useState(false);
    const { toggleCursor } = useTheme();
    const { birthYear, gender, loading } = useUserInfo();

    useEffect(() => {
        // Check if it's first installation or user info is empty
        chrome.storage.local.get(["isFirstInstall"], (result) => {
            if (result.isFirstInstall === undefined) {
                // First time installation
                chrome.storage.local.set({ isFirstInstall: true });
                setIsOnboarding(true);
                window.parent.postMessage(
                    { type: "RESIZE_IFRAME", isOpen: true },
                    "*",
                );
            } else if (!birthYear && !gender && !loading) {
                // User info is empty, show onboarding
                setIsOnboarding(true);
                window.parent.postMessage(
                    { type: "RESIZE_IFRAME", isOpen: true },
                    "*",
                );
            }
        });
    }, [birthYear, gender, loading]);

    const handleOnboardingComplete = () => {
        setIsOnboarding(false);
        setShowUserInfo(true);
        chrome.storage.local.set({ isFirstInstall: false });
    };

    const handleUserInfoComplete = () => {
        setShowUserInfo(false);
        window.parent.postMessage(
            { type: "RESIZE_IFRAME", isOpen: false },
            "*",
        );
    };

    const openModal = () => {
        setIsModalOpen(true);
        window.parent.postMessage({ type: "RESIZE_IFRAME", isOpen: true }, "*");
    };

    const toggleModal = () => {
        const newState = !isModalOpen;
        setIsModalOpen(newState);

        if (!newState) {
            setSelectedMenu(null);
            setIsOnboarding(false);
        }

        window.parent.postMessage(
            { type: "RESIZE_IFRAME", isOpen: newState },
            "*",
        );
    };

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === "TOGGLE_MODAL") {
                toggleModal();
            } else if (event.data.type === "TOGGLE_CURSOR") {
                toggleCursor();
            }
        };

        window.addEventListener("message", handleMessage);

        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, [isModalOpen]);

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedMenu(null);
        setIsOnboarding(false);
        window.parent.postMessage(
            { type: "RESIZE_IFRAME", isOpen: false },
            "*",
        );
    };

    const handleMenuClick = (menuId: string) => {
        setSelectedMenu(menuId === selectedMenu ? null : menuId);
    };

    useEffect(() => {
        chrome.storage.local.get("logo-hidden", (res) => {
            if (res["logo-hidden"]) {
                document.getElementById("logo")?.classList.add("hidden");
            }
        });

        const handleMessage = (event: MessageEvent) => {
            switch (event.data.type) {
                case "TOGGLE_MODAL":
                    toggleModal();
                    break;
                case "TOGGLE_CURSOR":
                    toggleCursor();
                    break;
                case "HIDE_LOGO":
                    document.getElementById("logo")?.classList.add("hidden");
                    chrome.storage.local.set({ "logo-hidden": true });
                    break;
                case "SHOW_LOGO":
                    document.getElementById("logo")?.classList.remove("hidden");
                    chrome.storage.local.set({ "logo-hidden": false });
                    break;
                default:
                    break;
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [isModalOpen]);

    if (isOnboarding) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
                <Onboarding onComplete={handleOnboardingComplete} />
            </div>
        );
    }

    if (showUserInfo) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
                <MyInfo onComplete={handleUserInfoComplete} />
            </div>
        );
    }

    return (
        <div className="pointer-events-auto">
            {!isModalOpen && <FloatingButton onClick={openModal} />}

            <Menubar isOpen={isModalOpen} onClose={closeModal}>
                {menuItems.map((item) => (
                    <MenubarButton
                        key={item.id}
                        isSelected={selectedMenu === item.id}
                        text={item.text}
                        onClick={() => handleMenuClick(item.id)}
                        ariaLabel={`${item.text} 선택`}
                    />
                ))}
                <div
                    className={`fixed right-[500px] top-[70px] bg-none overflow-y-auto transition-transform duration-300 z-[10000] ${
                        isModalOpen && selectedMenu !== null ? "flex" : "hidden"
                    }`}
                >
                    <PanelContent menuId={selectedMenu} />
                </div>
            </Menubar>
        </div>
    );
};

export default App;
