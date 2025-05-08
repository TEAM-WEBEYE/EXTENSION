import React, { useEffect, useState } from "react";

import { FloatingButton } from "@src/components/floatingButton";
import { Menubar } from "@src/components/menubar";
import { MenubarButton } from "@src/components/menubarButton";
import { useCursorTheme } from "@src/contexts/CursorContext";
import { CursorTab } from "@src/components/cursorTab";
import { ShortcutTab } from "@src/components/shortcutTab";
import ControlMode from "@src/components/modeButton/ControlMode";
import ControlFont from "@src/components/fontButton/ControlFont";

import "../css/app.css";

interface PanelContentProps {
    menuId: string | null;
}

const PanelContent: React.FC<PanelContentProps> = ({ menuId }) => {
    switch (menuId) {
        case "high-contrast":
            return <ControlMode />;
        case "cursor":
            return <CursorTab />;
        case "font":
            return <ControlFont />;
        case "shortcut":
            return <ShortcutTab />;
        default:
            return null;
    }
};

const menuItems = [
    { id: "high-contrast", text: "고대비 화면 사용하기" },
    { id: "cursor", text: "마우스 커서 설정하기" },
    { id: "font", text: "글자 설정하기" },
    { id: "shortcut", text: "단축키 안내 보기" },
];

const App = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
    const { toggleCursor } = useCursorTheme();

    const openModal = () => {
        setIsModalOpen(true);
        window.parent.postMessage({ type: "RESIZE_IFRAME", isOpen: true }, "*");
    };

    const toggleModal = () => {
        const newState = !isModalOpen;
        setIsModalOpen(newState);

        if (!newState) {
            setSelectedMenu(null);
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
            }
        };

        window.addEventListener("message", handleMessage);

        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, [isModalOpen]);

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
        window.parent.postMessage(
            { type: "RESIZE_IFRAME", isOpen: false },
            "*",
        );
    };

    const handleMenuClick = (menuId: string) => {
        setSelectedMenu(menuId === selectedMenu ? null : menuId);
    };

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
                    className={`fixed right-[500px] top-[70px] bg-none overflow-y-auto z-[999] transition-transform duration-300 ${
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
