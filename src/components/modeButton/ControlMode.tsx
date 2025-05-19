import React, { useEffect, useState } from "react";
import { ModeButton } from "./component";
import { useTheme } from "@src/contexts/ThemeContext";

const ControlMode = () => {
    const [selectedMode, setSelectedMode] = useState<"LIGHT" | "DARK">("LIGHT");
    const { fontClasses, setTheme, theme } = useTheme();
    const isDarkMode = theme === "dark";

    const modeMap: Record<string, "LIGHT" | "DARK"> = {
        "흰 배경\n검은 글씨": "LIGHT",
        "검은 배경\n흰 글씨": "DARK",
    };

    useEffect(() => {
        // 테마가 변경될 때마다 선택된 모드 업데이트
        setSelectedMode(isDarkMode ? "DARK" : "LIGHT");

        if (isDarkMode) {
            document.body.style.filter = "invert(1) hue-rotate(180deg)";
        } else {
            document.body.style.filter = "none";
        }
    }, [isDarkMode]);

    const handleModeClick = (label: string) => {
        const value = modeMap[label];
        setSelectedMode(value);

        const themeMode = value === "DARK" ? "dark" : "light";
        setTheme(themeMode);

        // chrome.storage에 테마 저장
        if (chrome?.storage?.sync) {
            chrome.storage.sync
                .set({ themeMode: `SET_MODE_${value}` })
                .catch((err) => console.error("테마 모드 저장 오류:", err));
        }

        // chrome.runtime으로 메시지 전송
        chrome.runtime.sendMessage(
            { type: `SET_MODE_${value}` },
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error("에러:", chrome.runtime.lastError.message);
                } else {
                    console.log("응답:", response);
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
