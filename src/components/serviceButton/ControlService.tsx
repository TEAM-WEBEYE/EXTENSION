import React, { useState } from "react";
import { useTheme } from "@src/contexts/ThemeContext";
import { ServiceButton } from "./component";

const ControlService = () => {
    const { theme, fontClasses } = useTheme();
    const isDarkMode = theme === "dark";

    const [isLogoVisible, setIsLogoVisible] = useState(true);

    const stopExtension = () => {
        chrome.runtime.sendMessage({ type: "STOP_EXTENSION" }, () => {
            window.close();
        });
    };

    const toggleLogo = (visible: boolean) => {
        const iframe = document.getElementById(
            "floating-button-extension-iframe",
        ) as HTMLIFrameElement;

        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage(
                { type: visible ? "SHOW_LOGO" : "HIDE_LOGO" },
                "*",
            );
        }
        chrome.storage.local.set({ "logo-hidden": !visible });
        setIsLogoVisible(visible);
    };

    return (
        <div
            className={`inline-flex flex-col items-start p-[18px] rounded-[20px] shadow-[0_0_4px_0_rgba(0,0,0,0.25)] space-y-[18px] ${
                isDarkMode
                    ? `bg-grayscale-900 text-grayscale-100`
                    : `bg-grayscale-100 text-grayscale-900`
            }`}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex flex-col gap-[18px]">
                <h2 className={fontClasses.fontCommon}>
                    서비스 실행 여부 설정하기
                </h2>
                <ServiceButton onClick={stopExtension}>종료하기</ServiceButton>
            </div>

            <div className="flex flex-col gap-[18px]">
                <h2 className={fontClasses.fontCommon}>
                    아이콘 노출 여부 설정하기
                </h2>
                <div className="flex gap-4">
                    <ServiceButton
                        onClick={() => toggleLogo(true)}
                        isSelected={isLogoVisible}
                    >
                        보이기
                    </ServiceButton>
                    <ServiceButton
                        onClick={() => toggleLogo(false)}
                        isSelected={!isLogoVisible}
                    >
                        숨기기
                    </ServiceButton>
                </div>
            </div>
        </div>
    );
};

export default ControlService;
