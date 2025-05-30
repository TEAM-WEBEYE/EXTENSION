import React, { useState } from "react";
import { InfoForm } from "./components";
import { useTheme } from "@src/contexts/ThemeContext";
import { AllergyHasForm } from "./components/AllergyHasForm";
import { AllergySelectForm } from "./components/AllergySelectForm";
import { CheckmarkIcon } from "@src/components/icons";

export function MyInfo({ onComplete }: { onComplete?: () => void }) {
    const { fontClasses, theme } = useTheme();
    const isDarkMode = theme === "dark";
    const [step, setStep] = useState(1);

    const nextStep = () => setStep((prev) => prev + 1);

    return (
        <div
            className={`font-koddi ${fontClasses.fontCommon} p-[18px] rounded-[20px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] ${
                isDarkMode
                    ? `bg-grayscale-900 text-grayscale-100`
                    : `bg-grayscale-100 text-grayscale-900`
            }`}
        >
            <div
                className={`mb-[26px] flex items-center gap-2 ${fontClasses.fontCaption}`}
            >
                <CheckmarkIcon width={30} height={30} />
                식품 구매에 대한 맞춤 정보 제공을 위해 나이, 성별을
                입력해주세요.
            </div>
            {step === 1 && <InfoForm nextStep={nextStep} />}
            {step === 2 && (
                <AllergyHasForm nextStep={nextStep} onComplete={onComplete} />
            )}
            {step === 3 && <AllergySelectForm onComplete={onComplete} />}
        </div>
    );
}
