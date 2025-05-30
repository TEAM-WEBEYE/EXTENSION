import React from "react";
import { BaseFillButton } from "@src/components/baseFillButton/component";
import { useTheme } from "@src/contexts/ThemeContext";
import { BaseButton } from "@src/components/baseButton/component";
import { useUserInfo } from "@src/hooks/useUserInfo";

interface InfoFormProps {
    nextStep: () => void;
}

export function InfoForm({ nextStep }: InfoFormProps) {
    const { fontClasses, theme } = useTheme();
    const isDarkMode = theme === "dark";
    const {
        birthYear,
        setBirthYear,
        gender,
        setGender,
        error,
        saved,
        loading,
        handleSave,
    } = useUserInfo();

    const handleSaveWithComplete = async () => {
        await handleSave();
        nextStep();
    };
    return (
        <>
            <div className="mb-[26px]">
                <div className="mb-4">
                    출생연도를 4자리 숫자로 입력해주세요.
                </div>
                <input
                    id="birthYearInput"
                    type="text"
                    inputMode="numeric"
                    placeholder="예시 2025"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    className={`
        w-[692px] rounded-[14px] mb-4 px-6 py-[18px]
        ${
            isDarkMode
                ? "bg-grayscale-800 text-grayscale-100 focus:border-purple-light"
                : "bg-grayscale-200 text-grayscale-900  focus:border-purple-default"
        }
        focus:outline-none focus:border-4
    `}
                />
                {error && (
                    <p className="text-purple-default">
                        숫자를 다시 확인해주세요. {error}
                    </p>
                )}
            </div>

            <div className="mb-[26px]">
                <div className="mb-4">성별 설정하기</div>
                <div className="flex gap-[20px]">
                    <BaseButton
                        onClick={() => setGender("female")}
                        isSelected={gender === "female"}
                        nonCheck={true}
                        ariaLabel="여성"
                    >
                        여성
                    </BaseButton>{" "}
                    <BaseButton
                        onClick={() => setGender("male")}
                        isSelected={gender === "male"}
                        nonCheck={true}
                        ariaLabel="남성"
                    >
                        남성
                    </BaseButton>
                </div>
            </div>

            <BaseFillButton
                onClick={handleSaveWithComplete}
                isDisabled={!!error || loading}
            >
                다음
            </BaseFillButton>
        </>
    );
}
