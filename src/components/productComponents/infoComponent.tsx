import React, { useEffect, useState } from "react";
import { sendOutlineInfoRequest } from "../../content/apiSetting/sendInfoRequest";
import { BaseFillButton } from "../baseFillButton/component";
import { BaseButton } from "../baseButton/component";
import { useTheme } from "@src/contexts/ThemeContext";
import Loading from "../Loading/component";

type OutlineCategory = "MAIN" | "USAGE" | "WARNING" | "SPECS" | "CERTIFICATION";

interface InfoComponentProps {
    categoryType: "food" | "cosmetic" | "health" | "none" | null;
}

export const InfoComponent: React.FC<InfoComponentProps> = ({
    categoryType,
}) => {
    const { theme, fontClasses } = useTheme();
    const isDarkMode = theme === "dark";

    const [selected, setSelected] = useState<OutlineCategory | null>(null);
    const [info, setInfo] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [mainLabel, setMainLabel] = useState("스펙 및 제조 정보");

    useEffect(() => {
        if (categoryType === "food" || categoryType === "health") {
            setMainLabel("영양 및 원재료");
        } else {
            setMainLabel("스펙 및 제조 정보");
        }
    }, [categoryType]);

    const outlineCategories = [
        { key: "MAIN", label: mainLabel },
        { key: "USAGE", label: "사용 방법 및 대상" },
        { key: "WARNING", label: "주의 및 보관" },
        { key: "SPECS", label: "구성 및 디자인" },
    ] as const;

    const fetchVendorHtml = (): Promise<string> => {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
                { type: "FETCH_VENDOR_HTML" },
                (response) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve(response?.html ?? "");
                    }
                },
            );
        });
    };

    const handleClick = async (outline: OutlineCategory) => {
        if (selected === outline) {
            setSelected(null);
            return;
        }

        setSelected(outline);
        setLoading(true);

        try {
            const html = await fetchVendorHtml();
            const result = await sendOutlineInfoRequest(outline, html);
            setInfo(result || "정보가 없습니다.");
        } catch (error) {
            console.error("[voim] INFO 요청 실패:", error);
            setInfo("정보를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            {outlineCategories.map(({ key, label }) => (
                <div key={key}>
                    {selected === key ? (
                        <div>
                            <BaseFillButton onClick={() => setSelected(null)}>
                                {label} 닫기
                            </BaseFillButton>
                            <div
                                className={`mt-7 ${fontClasses.fontCommon} ${
                                    isDarkMode
                                        ? `text-grayscale-100`
                                        : `text-grayscale-900`
                                }`}
                            >
                                {loading ? (
                                    <div
                                        style={{
                                            padding: "16px",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            height: "320px",
                                        }}
                                    >
                                        <Loading />
                                        <div>불러오는 중</div>
                                    </div>
                                ) : (
                                    <ul className="pl-6 space-y-2 list-disc">
                                        {info
                                            .split("\n")
                                            .map((item) =>
                                                item.replace(/^-/, "").trim(),
                                            )
                                            .filter(Boolean)
                                            .map((item, index) => (
                                                <li
                                                    key={index}
                                                    className="leading-relaxed"
                                                    dangerouslySetInnerHTML={{
                                                        __html: item.replace(
                                                            /<strong>(.*?)<\/strong>/g,
                                                            `<strong style="color: #8914FF;">$1</strong>`,
                                                        ),
                                                    }}
                                                />
                                            ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="my-7">
                            <BaseButton
                                isFull={true}
                                onClick={() => handleClick(key)}
                            >
                                {label}
                            </BaseButton>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
