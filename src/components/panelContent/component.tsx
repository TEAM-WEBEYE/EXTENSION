import React, { useRef } from "react";
import { useFocusManagement } from "@src/hooks/useFocusManagement";
import { MyInfo } from "@src/tabs/myInfo";
import { menuItems } from "@src/constants/menuItems";
import ControlMode from "@src/tabs/modeButton/ControlMode";
import ControlFont from "@src/tabs/fontButton/ControlFont";
import { ShortcutTab } from "@src/tabs/shortcutTab";
import ControlService from "@src/tabs/serviceButton/ControlService";

interface PanelContentProps {
    menuId: string | null;
    setMenuId: (id: string | null) => void;
}

export const PanelContent: React.FC<PanelContentProps> = ({
    menuId,
    setMenuId,
}) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const { firstFocusableRef, lastFocusableRef, isPanelFocused } =
        useFocusManagement(menuId, panelRef);

    const renderPanelContent = () => {
        switch (menuId) {
            case "high-contrast":
                return <ControlMode onClose={() => setMenuId(null)} />;
            case "font":
                return <ControlFont onClose={() => setMenuId(null)} />;
            case "shortcut":
                return <ShortcutTab />;
            case "my-info":
                return <MyInfo onComplete={() => setMenuId(null)} />;
            case "service":
                return <ControlService onClose={() => setMenuId(null)} />;
            default:
                return null;
        }
    };

    if (!menuId) return null;

    return (
        <div
            ref={panelRef}
            tabIndex={isPanelFocused.current ? 0 : -1}
            role="tabpanel"
            aria-labelledby={`tab-${menuId}`}
            aria-label={`${menuItems.find((item) => item.id === menuId)?.text} 설정`}
        >
            {renderPanelContent()}
        </div>
    );
};
