import React, { useState, useEffect, useRef } from "react";
import { onboardingData } from "@src/assets/onboardingData";
import { useTheme } from "@src/contexts/ThemeContext";
import { CloseButton } from "@src/components/closeButton";
import { BaseFillButton } from "@src/components/baseFillButton/component";

interface OnboardingProps {
    onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
    const [currentPage, setCurrentPage] = useState<number>(0);
    const { fontClasses, theme } = useTheme();
    const isDarkMode = theme === "dark";

    const titleRef = useRef<HTMLDivElement>(null); // 👈 제목에 포커스하기 위한 ref

    const sections = [
        onboardingData.info,
        onboardingData.image,
        onboardingData.product,
        onboardingData.theme,
    ];

    const isLastPage = currentPage === sections.length - 1;

    const handleNext = () => {
        if (!isLastPage) {
            setCurrentPage((prev) => prev + 1);
        } else {
            onComplete();
        }
    };

    const handleClose = () => {
        onComplete();
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                handleClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        titleRef.current?.focus();
    }, [currentPage]);

    return (
        <div
            className={`font-koddi px-[18px] py-[24px] rounded-[20px] w-[755px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] flex flex-col gap-[26px] ${
                isDarkMode
                    ? `bg-grayscale-900 text-grayscale-100`
                    : `bg-grayscale-100 text-grayscale-900`
            }`}
        >
            <div
                className={`${fontClasses.fontHeading} flex justify-between items-center`}
            >
                <div
                    ref={titleRef}
                    tabIndex={-1} // 스크립트로 포커스 가능하게
                    aria-label={sections[currentPage].title}
                >
                    {sections[currentPage].title}
                </div>
                <CloseButton onClick={handleClose} />
            </div>
            <div>
                {sections[currentPage].phrase.map((text, index) => (
                    <div className={fontClasses.fontCommon} key={index}>
                        {text.split("\n").map((line, i) => (
                            <React.Fragment key={i}>
                                {line}
                                <br aria-hidden="true" />
                            </React.Fragment>
                        ))}
                    </div>
                ))}
            </div>
            <div className="onboarding-buttons">
                <BaseFillButton onClick={handleNext}>
                    {isLastPage ? "시작하기" : "다음"}
                </BaseFillButton>
            </div>
        </div>
    );
}
