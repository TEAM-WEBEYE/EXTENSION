import { useTheme } from "@src/contexts/ThemeContext";
import React from "react";
import { CursorButton } from "../cursorButton";

type CursorSize = "small" | "medium" | "large";
type CursorColor = "white" | "black" | "yellow" | "purple" | "mint" | "pink";

const CURSOR_SIZES: CursorSize[] = ["small", "medium", "large"];
const CURSOR_COLORS: CursorColor[] = [
    "white",
    "black",
    "yellow",
    "purple",
    "mint",
    "pink",
];

export function CursorTab() {
    const {
        setCursorSize,
        setCursorTheme,
        cursorSize,
        cursorTheme,
        theme,
        fontClasses,
    } = useTheme();

    const isDarkMode = theme === "dark";

    return (
        <div
            className={`font-koddi p-[18px] rounded-[20px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] ${
                isDarkMode
                    ? `bg-grayscale-900 text-grayscale-100`
                    : `bg-grayscale-100 text-grayscale-900`
            }`}
        >
            <section className="mb-[26px]">
                <h2 className={fontClasses.fontCommon}>커서 크기 바꾸기</h2>
                <div className="flex gap-5 p-2">
                    {CURSOR_SIZES.map((size) => (
                        <CursorButton
                            key={size}
                            onClick={() => setCursorSize(size)}
                            size={size}
                            isSelected={cursorSize === size}
                        />
                    ))}
                </div>
            </section>

            <section>
                <h2 className={fontClasses.fontCommon}>커서 색상 바꾸기</h2>
                <div className="grid grid-cols-3 gap-5 p-2">
                    {CURSOR_COLORS.map((color) => (
                        <CursorButton
                            key={color}
                            onClick={() => setCursorTheme(color)}
                            color={color}
                            isSelected={cursorTheme === color}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}
