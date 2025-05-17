import React, { useEffect, useState } from "react";
import type { FontWeight, FontSize } from "@src/contexts/ThemeContext";
import { FontButton } from "./component";
import { useTheme } from "@src/contexts/ThemeContext";

type UppercaseFontWeight = "REGULAR" | "BOLD" | "XBOLD";
type UppercaseFontSize = "XS" | "S" | "M" | "L" | "XL";

const ControlFont = () => {
    const [selectedWeight, setSelectedWeight] =
        useState<UppercaseFontWeight>("BOLD");
    const [selectedSize, setSelectedSize] = useState<UppercaseFontSize>("S");
    const {
        setFontSize,
        setFontWeight,
        fontClasses,
        theme,
        fontSize,
        fontWeight,
    } = useTheme();
    const isDarkMode = theme === "dark";

    const toFontWeight = (value: string): FontWeight => {
        return value.toLowerCase() as FontWeight;
    };

    const toFontSize = (value: string): FontSize => {
        return value.toLowerCase() as FontSize;
    };

    const toUpperFontWeight = (value: FontWeight): UppercaseFontWeight => {
        return value.toUpperCase() as UppercaseFontWeight;
    };

    const toUpperFontSize = (value: FontSize): UppercaseFontSize => {
        return value.toUpperCase() as UppercaseFontSize;
    };

    const weightMap: Record<string, UppercaseFontWeight> = {
        얇게: "REGULAR",
        기본: "BOLD",
        두껍게: "XBOLD",
    };

    const sizeMap: Record<string, UppercaseFontSize> = {
        "아주 작게": "XS",
        작게: "S",
        기본: "M",
        크게: "L",
        "아주 크게": "XL",
    };

    useEffect(() => {
        if (fontWeight) {
            const upperWeight = toUpperFontWeight(fontWeight);
            setSelectedWeight(upperWeight);
        }

        if (fontSize) {
            const upperSize = toUpperFontSize(fontSize);
            setSelectedSize(upperSize);
        }
    }, [fontWeight, fontSize]);

    function isValidFontWeight(value: string): value is UppercaseFontWeight {
        return ["REGULAR", "BOLD", "XBOLD"].includes(value);
    }

    function isValidFontSize(value: string): value is UppercaseFontSize {
        return ["XS", "S", "M", "L", "XL"].includes(value);
    }

    const sendMessage = (type: string) => {
        chrome.runtime.sendMessage({ type }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("에러:", chrome.runtime.lastError.message);
            } else {
                console.log("응답:", response);
            }
        });
    };

    const handleWeightClick = (label: string) => {
        const value = weightMap[label];
        setSelectedWeight(value);

        if (chrome?.storage?.sync) {
            chrome.storage.sync
                .set({ "font-weight": toFontWeight(value) })
                .catch((err) => console.error("폰트 굵기 저장 오류:", err));
        }

        sendMessage(`SET_FONT_WEIGHT_${value}`);

        const fontWeight = toFontWeight(value);
        setFontWeight(fontWeight);
    };

    const handleSizeClick = (label: string) => {
        const value = sizeMap[label];
        setSelectedSize(value);

        if (chrome?.storage?.sync) {
            chrome.storage.sync
                .set({ "font-size": toFontSize(value) })
                .catch((err) => console.error("폰트 크기 저장 오류:", err));
        }

        sendMessage(`SET_FONT_SIZE_${value}`);

        const fontSize = toFontSize(value);
        setFontSize(fontSize);
    };

    return (
        <div
            className={`inline-flex flex-col items-start p-[18px] rounded-[20px]  ${
                isDarkMode
                    ? `bg-grayscale-900 text-grayscale-100`
                    : `bg-grayscale-100 text-grayscale-900`
            } shadow-[0_0_4px_0_rgba(0,0,0,0.25)] space-y-[18px]`}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex flex-col gap-[26px]">
                <h2 className={fontClasses.fontCommon}>글자 두께 바꾸기</h2>
                <div className="flex gap-4">
                    {["얇게", "기본", "두껍게"].map((label) => (
                        <FontButton
                            key={label}
                            onClick={() => handleWeightClick(label)}
                            isSelected={weightMap[label] === selectedWeight}
                            fontType="weight"
                        >
                            {label}
                        </FontButton>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-[26px]">
                <h2 className={fontClasses.fontCommon}>글자 크기 바꾸기</h2>
                <div className="flex flex-wrap gap-4">
                    {["아주 작게", "작게", "기본", "크게", "아주 크게"].map(
                        (label) => (
                            <FontButton
                                key={label}
                                onClick={() => handleSizeClick(label)}
                                isSelected={sizeMap[label] === selectedSize}
                                fontType="size"
                            >
                                {label}
                            </FontButton>
                        ),
                    )}
                </div>
            </div>
        </div>
    );
};

export default ControlFont;
