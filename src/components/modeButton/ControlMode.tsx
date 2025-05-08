import React, { useEffect, useState } from "react";
import { ModeButton } from "./component";
import { useAppTheme, ThemeMode } from "@src/contexts/ThemeContext";

const ControlMode = () => {
    const [selectedMode, setSelectedMode] = useState<"LIGHT" | "DARK">("LIGHT");
    const { fontClasses, setTheme, theme } = useAppTheme();
    const isDarkMode = theme === "dark";

    const modeMap: Record<string, "LIGHT" | "DARK"> = {
        "흰 배경\n검은 글씨": "LIGHT",
        "검은 배경\n흰 글씨": "DARK",
    };

    useEffect(() => {
        if (theme === "light") {
            setSelectedMode("LIGHT");
        } else if (theme === "dark") {
            setSelectedMode("DARK");
        }
    }, [theme]);

    const toThemeMode = (value: string): ThemeMode => {
        return value.toLowerCase() as ThemeMode;
    };

    const sendMessage = (type: string) => {
        chrome.runtime.sendMessage({ type }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("에러:", chrome.runtime.lastError.message);
            } else {
                console.log("응답:", response);
            }
        });
    };

    const handleModeClick = (label: string) => {
        const value = modeMap[label];
        setSelectedMode(value);

        const themeMode = toThemeMode(value);
        setTheme(themeMode);

        if (chrome?.storage?.sync) {
            chrome.storage.sync
                .set({ "theme-mode": themeMode })
                .catch((err) => console.error("테마 모드 저장 오류:", err));
        }

        sendMessage(`SET_MODE_${value}`);
    };

    return (
        <div
            className={` inline-flex flex-col items-start p-[18px] rounded-[20px] ${
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
                        >
                            {label.split("\n").map((line, i) => (
                                <div key={i}>{line}</div>
                            ))}
                        </ModeButton>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ControlMode;
