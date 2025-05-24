import React from "react";
import type { Dispatch, SetStateAction } from "react";
import { BaseFillButton } from "@src/components/baseFillButton/component";
import { useTheme } from "@src/contexts/ThemeContext";
import { BaseButton } from "@src/components/baseButton/component";

interface InfoFormProps {
    birthYear: string;
    setBirthYear: Dispatch<SetStateAction<string>>;
    gender: "" | "male" | "female";
    setGender: Dispatch<SetStateAction<"" | "male" | "female">>;
    error: string;
    saved: boolean;
    loading: boolean;
    handleSave: () => void;
}

export function InfoForm({
    birthYear,
    setBirthYear,
    gender,
    setGender,
    error,
    saved,
    loading,
    handleSave,
}: InfoFormProps) {
    const { fontClasses, theme } = useTheme();
    const isDarkMode = theme === "dark";

    return (
        <div
            className={`font-koddi ${fontClasses.fontCommon} p-[18px] rounded-[20px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] ${
                isDarkMode
                    ? `bg-grayscale-900 text-grayscale-100`
                    : `bg-grayscale-100 text-grayscale-900`
            }`}
        >
            <div className="mb-[26px]">
                식품 구매에 대한 맞춤 정보 제공을 위해 나이, 성별을
                입력해주세요.
            </div>
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
        w-full rounded-[14px] mb-4 px-6 py-[18px]
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
                    >
                        여성
                    </BaseButton>{" "}
                    <BaseButton
                        onClick={() => setGender("male")}
                        isSelected={gender === "male"}
                    >
                        남성
                    </BaseButton>
                </div>
            </div>

            <BaseFillButton
                onClick={handleSave}
                isDisabled={!!error || loading}
            >
                저장하기
            </BaseFillButton>
        </div>
    );
}
