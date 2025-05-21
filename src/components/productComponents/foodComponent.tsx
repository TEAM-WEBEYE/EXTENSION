import React, { useEffect, useState } from "react";

interface NutrientAlert {
    name: string;
    percent: number;
}

export const FoodComponent = () => {
    const [nutrientAlerts, setNutrientAlerts] = useState<
        NutrientAlert[] | null
    >(null);

    useEffect(() => {
        const fetchNutrientData = async () => {
            const { birthYear, gender } = await chrome.storage.local.get([
                "birthYear",
                "gender",
            ]);

            if (!birthYear || !gender) {
                console.warn("birthYear 또는 gender가 없습니다.");
                return;
            }

            const match = window.location.href.match(/products\/(\d+)/);
            const productId = match ? match[1] : null;
            if (!productId) {
                console.warn("productId를 추출하지 못했습니다.");
                return;
            }

            const imgEl = document.querySelector(
                ".type_IMAGE_NO_SPACE .subType-IMAGE img",
            ) as HTMLImageElement | null;

            const imgUrl = imgEl?.getAttribute("src");
            const fullImgUrl = imgUrl?.startsWith("//")
                ? "https:" + imgUrl
                : imgUrl;

            if (!fullImgUrl) {
                console.warn("이미지 URL을 찾지 못했습니다.");
                return;
            }

            const payload = {
                productId,
                title: document.title,
                urls: [fullImgUrl],
                birthYear: Number(birthYear),
                gender: gender.toUpperCase(),
                allergies: [],
            };

            console.log(" FETCH_FOOD_DATA 메시지 전송됨:", payload);

            chrome.runtime.sendMessage({ type: "FETCH_FOOD_DATA", payload });
        };

        fetchNutrientData();

        const handleMessage = (event: MessageEvent) => {
            if (event.source !== window) return;

            if (event.data?.type === "VOIM_FOOD_DATA") {
                console.log(" 영양소 데이터 수신:", event.data.data);
                setNutrientAlerts(event.data.data.exceededNutrients);
            }

            if (event.data?.type === "VOIM_FOOD_ERROR") {
                console.error(" Food API 에러:", event.data.error);
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    if (!nutrientAlerts) return null;

    return (
        <div className="fixed bottom-5 right-5 bg-white border-2 border-purple-default rounded-[12px] p-4 shadow-lg z-[9999] w-80">
            <p className="text-purple-default font-bold mb-2">
                [식품] 영양성분 하루 기준치 초과 주의
            </p>
            <p className="text-grayscale-700 text-sm mb-2">
                하루 기준 섭취량의 40%를 넘는 영양성분이 {nutrientAlerts.length}
                가지 들어 있습니다. 섭취 시 참고해주세요.
            </p>
            <ul className="text-sm text-grayscale-800">
                {nutrientAlerts.map((item) => (
                    <li
                        key={item.name}
                        className="flex justify-between border-b border-grayscale-300 py-1"
                    >
                        <span>{item.name}</span>
                        <span className="font-bold">{item.percent}%</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};
