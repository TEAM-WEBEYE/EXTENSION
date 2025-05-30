import React, { useEffect, useState } from "react";
import { ModeButton } from "./component";
import { useTheme } from "@src/contexts/ThemeContext";
import { STORAGE_KEYS } from "../../background/constants";

interface ControlModeProps {
    onClose: () => void;
}

const ControlMode: React.FC<ControlModeProps> = ({ onClose }) => {
    const [selectedMode, setSelectedMode] = useState<"LIGHT" | "DARK">("LIGHT");
    const [hasChanged, setHasChanged] = useState(false);
    const { fontClasses, setTheme, theme } = useTheme();
    const isDarkMode = theme === "dark";

    const modeMap: Record<string, "LIGHT" | "DARK"> = {
        "흰 배경\n검은 글씨": "LIGHT",
        "검은 배경\n흰 글씨": "DARK",
    };

    useEffect(() => {
        setSelectedMode(isDarkMode ? "DARK" : "LIGHT");
    }, [isDarkMode]);

    const handleModeClick = (label: string) => {
        const value = modeMap[label];
        if (value !== selectedMode) {
            setHasChanged(true);
        }

        setSelectedMode(value);

        const themeMode = value === "DARK" ? "dark" : "light";
        setTheme(themeMode);
        chrome.storage?.local
            .set({ [STORAGE_KEYS.THEME_MODE]: `SET_MODE_${value}` })
            .catch((err) => console.error("테마 모드 저장 오류:", err));

        chrome.runtime.sendMessage(
            { type: `SET_MODE_${value}` },
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error("에러:", chrome.runtime.lastError.message);
                }
            },
        );
    };

    return (
        <div
            className={`inline-flex flex-col items-start p-[18px] rounded-[20px] ${
                isDarkMode
                    ? `bg-grayscale-900 text-grayscale-100`
                    : `bg-grayscale-100 text-grayscale-900`
            } shadow-[0_0_4px_0_rgba(0,0,0,0.25)] space-y-[18px]`}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex flex-col gap-[26px]">
                <h2 className={fontClasses.fontCommon}>고대비 화면 설정하기</h2>
                <div className="flex flex-wrap gap-4">
                    {Object.entries(modeMap).map(([label, value]) => (
                        <ModeButton
                            key={label}
                            onClick={() => handleModeClick(label)}
                            isSelected={value === selectedMode}
                            modeType={value}
                            aria-label={
                                "고대비 화면 설정 " + label.replace("\n", " ")
                            }
                        >
                            {label.split("\n").map((line, i) => (
                                <div key={i}>{line}</div>
                            ))}
                        </ModeButton>
                    ))}
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

export default ControlMode;
