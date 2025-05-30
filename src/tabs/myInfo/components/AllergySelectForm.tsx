import React, { useState } from "react";
import { BaseButton } from "@src/components/baseButton/component";
import { BaseFillButton } from "@src/components/baseFillButton/component";
import { LeftArrowIcon } from "@src/components/icons/LeftArrowIcon";
import { RightArrowIcon } from "@src/components/icons/RightArrowIcon";
import { IconButton } from "@src/components/IconButton";
import { useTheme } from "@src/contexts/ThemeContext";
import { ContentBox } from "@src/components/contentBox";
import { CloseIcon } from "@src/components/icons/CloseIcon";
export enum AllergyType {
    EGG = "EGG", // 계란
    MILK = "MILK", // 우유
    BUCKWHEAT = "BUCKWHEAT", // 메밀
    PEANUT = "PEANUT", // 땅콩
    SOYBEAN = "SOYBEAN", // 대두
    WHEAT = "WHEAT", // 밀
    PINE_NUT = "PINE_NUT", // 잣
    WALNUT = "WALNUT", // 호두
    CRAB = "CRAB", // 게
    SHRIMP = "SHRIMP", // 새우
    SQUID = "SQUID", // 오징어
    MACKEREL = "MACKEREL", // 고등어
    SHELLFISH = "SHELLFISH", // 조개류
    PEACH = "PEACH", // 복숭아
    TOMATO = "TOMATO", // 토마토
    CHICKEN = "CHICKEN", // 닭고기
    PORK = "PORK", // 돼지고기
    BEEF = "BEEF", // 쇠고기
    SULFITE = "SULFITE", // 아황산류
}

const allergyData = {
    식물성: ["메밀", "대두", "밀", "땅콩", "잣", "호두", "토마토", "복숭아"],
    동물성: ["계란", "우유", "닭고기", "돼지고기", "쇠고기"],
    해산물: ["게", "새우", "오징어", "고등어", "조개류"],
    "첨가물 및 기타": ["아황산류"],
} as const;
const allergyNameToEnumMap: Record<string, AllergyType> = {
    계란: AllergyType.EGG,
    우유: AllergyType.MILK,
    메밀: AllergyType.BUCKWHEAT,
    땅콩: AllergyType.PEANUT,
    대두: AllergyType.SOYBEAN,
    밀: AllergyType.WHEAT,
    잣: AllergyType.PINE_NUT,
    호두: AllergyType.WALNUT,
    게: AllergyType.CRAB,
    새우: AllergyType.SHRIMP,
    오징어: AllergyType.SQUID,
    고등어: AllergyType.MACKEREL,
    조개류: AllergyType.SHELLFISH,
    복숭아: AllergyType.PEACH,
    토마토: AllergyType.TOMATO,
    닭고기: AllergyType.CHICKEN,
    돼지고기: AllergyType.PORK,
    쇠고기: AllergyType.BEEF,
    아황산류: AllergyType.SULFITE,
};

type AllergyCategory = keyof typeof allergyData;

const ALL_CATEGORY = Object.keys(allergyData) as AllergyCategory[];

export function AllergySelectForm({ onComplete }: { onComplete?: () => void }) {
    const { theme } = useTheme();
    const isDarkMode = theme === "dark";
    const [selectedCategory, setSelectedCategory] = useState<AllergyCategory>(
        ALL_CATEGORY[0],
    );
    const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);

    const changeCategory = (direction: "prev" | "next") => {
        const currentIndex = ALL_CATEGORY.indexOf(selectedCategory);
        let newIndex;
        if (direction === "prev") {
            newIndex =
                currentIndex === 0 ? ALL_CATEGORY.length - 1 : currentIndex - 1;
        } else {
            newIndex =
                currentIndex === ALL_CATEGORY.length - 1 ? 0 : currentIndex + 1;
        }
        setSelectedCategory(ALL_CATEGORY[newIndex]);
    };

    const toggleAllergy = (item: string) => {
        setSelectedAllergies((prev) =>
            prev.includes(item)
                ? prev.filter((a) => a !== item)
                : [...prev, item],
        );
    };

    return (
        <div className="w-[692px] min-h-[638px] max-h-[638px] flex-col flex justify-between overflow-y-auto">
            <div>
                <div className="mb-8">알러지 선택하기</div>
                <div className="flex items-center justify-center gap-4 mb-4">
                    <IconButton
                        onClick={() => changeCategory("prev")}
                        aria-label="이전 카테고리"
                    >
                        <LeftArrowIcon />
                        <span className="sr-only">이전 카테고리</span>
                    </IconButton>
                    <ContentBox>
                        <div className="w-full text-center">
                            {selectedCategory}
                        </div>
                    </ContentBox>
                    <IconButton
                        onClick={() => changeCategory("next")}
                        aria-label="다음 카테고리"
                    >
                        <RightArrowIcon />
                        <span className="sr-only">다음 카테고리</span>
                    </IconButton>
                </div>

                <div className="flex flex-wrap gap-[20px] mb-[20px]">
                    {allergyData[selectedCategory].map((item: string) => (
                        <BaseButton
                            key={item}
                            onClick={() => toggleAllergy(item)}
                            isSelected={selectedAllergies.includes(item)}
                            nonCheck={true}
                            aria-label={`${item}`}
                        >
                            {item}
                        </BaseButton>
                    ))}
                </div>
            </div>
            <div>
                <div className="mb-2">선택한 알러지 확인하기</div>

                <div
                    className={`p-2 flex flex-wrap gap-2 mb-[44px] rounded-[18px] min-h-[92px] ${isDarkMode ? "bg-grayscale-800" : "bg-grayscale-200"}`}
                >
                    {selectedAllergies.map((item) => (
                        <BaseButton
                            nonCheck={true}
                            isSelected={selectedAllergies.includes(item)}
                            key={item}
                            onClick={() =>
                                setSelectedAllergies((prev) =>
                                    prev.filter((a) => a !== item),
                                )
                            }
                            aria-label={`${item} 제거`}
                        >
                            <div className="flex items-center gap-5">
                                {item}

                                <CloseIcon />
                            </div>
                        </BaseButton>
                    ))}
                </div>

                <BaseFillButton
                    onClick={() => {
                        const allergyEnumArray = selectedAllergies
                            .map((name) => allergyNameToEnumMap[name])
                            .filter(Boolean) as AllergyType[];
                        const menuButtons = document.querySelectorAll(
                            '[data-testid="menubar-content"] button',
                        );
                        const myInfoButton = Array.from(menuButtons).find(
                            (button) =>
                                button
                                    .getAttribute("aria-label")
                                    ?.includes("서비스 설정하기"),
                        );
                        if (myInfoButton) {
                            (myInfoButton as HTMLElement).focus();
                        }

                        chrome.storage.local.set(
                            {
                                Allergies: allergyEnumArray,
                            },
                            () => {
                                onComplete?.();
                            },
                        );
                    }}
                >
                    저장하기
                </BaseFillButton>
            </div>
        </div>
    );
}
