import React, { useState } from "react";
import { useTheme } from "@src/contexts/ThemeContext";
import { ServiceButton } from "./component";

interface ControlServiceProps {
    onClose: () => void;
}

const ControlService: React.FC<ControlServiceProps> = ({ onClose }) => {
    const { theme, fontClasses } = useTheme();
    const isDarkMode = theme === "dark";

    const [isLogoVisible, setIsLogoVisible] = useState(true);
    const [hasChanged, setHasChanged] = useState(false);

    const stopExtension = () => {
        chrome.runtime.sendMessage(
            { type: "SET_STYLES_ENABLED", enabled: false },
            () => {
                setHasChanged(true);
                window.close();
            },
        );
    };

    const toggleLogo = (visible: boolean) => {
        if (visible !== isLogoVisible) setHasChanged(true);
        chrome.runtime.sendMessage(
            { type: "SET_IFRAME_VISIBLE", visible },
            () => {
                setIsLogoVisible(visible);
            },
        );
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

            <button
                onClick={onClose}
                className="w-full h-[68px] mt-[18px] py-[10px] rounded-[14px] bg-purple-default text-white font-20-Bold"
            >
                {hasChanged ? "완료" : "닫기"}
            </button>
        </div>
    );
};

export default ControlService;
