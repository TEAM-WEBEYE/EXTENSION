import React, { useState, useEffect } from "react";
import { BaseButton } from "@src/components/baseButton/component";
import { BaseFillButton } from "@src/components/baseFillButton/component";
import { useTheme } from "@src/contexts/ThemeContext";

interface AllergyHasFormProps {
    nextStep: () => void;
    onComplete?: () => void;
}

export function AllergyHasForm({ nextStep, onComplete }: AllergyHasFormProps) {
    const { fontClasses, theme } = useTheme();
    const isDarkMode = theme === "dark";

    const [hasAllergy, setHasAllergy] = useState<boolean | null>(null);

    // 로컬스토리지에서 값 불러오기
    useEffect(() => {
        chrome.storage.local.get(["hasAllergy"], (result) => {
            if (result.hasAllergy === true) setHasAllergy(true);
            else if (result.hasAllergy === false) setHasAllergy(false);
        });
    }, []);

    const handleClick = () => {
        if (hasAllergy === false) {
            const menuButtons = document.querySelectorAll(
                '[data-testid="menubar-content"] button',
            );
            const myInfoButton = Array.from(menuButtons).find((button) =>
                button.getAttribute("aria-label")?.includes("서비스 설정하기"),
            );
            if (myInfoButton) {
                (myInfoButton as HTMLElement).focus();
            }

            chrome.storage.local.set({ hasAllergy: false }, () => {
                if (onComplete) {
                    onComplete();
                }
            });
        } else if (hasAllergy === true) {
            nextStep();
        }
    };

    return (
        <>
            <div
                className={`mb-[26px] flex items-center gap-2 ${fontClasses.fontCaption}`}
            >
                알러지가 있으신가요?
            </div>

            <div className="mb-[40px]">
                <div className="flex gap-[20px]">
                    <BaseButton
                        onClick={() => setHasAllergy(false)}
                        isSelected={hasAllergy === false}
                        nonCheck={true}
                        ariaLabel="알러지가 없어요"
                    >
                        <div className="text-center w-[272px]">
                            알러지가 없어요
                        </div>
                    </BaseButton>
                    <BaseButton
                        onClick={() => setHasAllergy(true)}
                        isSelected={hasAllergy === true}
                        nonCheck={true}
                        ariaLabel="알러지가 있어요"
                    >
                        <div className="text-center w-[272px]">
                            알러지가 있어요
                        </div>
                    </BaseButton>
                </div>
            </div>

            <BaseFillButton onClick={handleClick}>
                {hasAllergy === false ? "저장하기" : "다음"}
            </BaseFillButton>
        </>
    );
}
