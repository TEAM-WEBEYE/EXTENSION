import type { FontSize, FontWeight } from "@src/contexts/ThemeContext";

export const fontSizeClassMap: Record<
    FontSize,
    { heading: string; common: string; caption: string }
> = {
    xl: {
        heading: "text-[32px]",
        common: "text-[28px]",
        caption: "text-[24px]",
    },
    l: {
        heading: "text-[30px]",
        common: "text-[26px]",
        caption: "text-[22px]",
    },
    m: {
        heading: "text-[28px]",
        common: "text-[24px]",
        caption: "text-[20px]",
    },
    s: {
        heading: "text-[26px]",
        common: "text-[22px]",
        caption: "text-[18px]",
    },
    xs: {
        heading: "text-[24px]",
        common: "text-[20px]",
        caption: "text-[16px]",
    },
};

export const fontWeightClassMap: Record<FontWeight, string> = {
    xbold: "font-extrabold",
    bold: "font-bold",
    regular: "font-normal",
};

export function getFontClasses(fontSize: FontSize, fontWeight: FontWeight) {
    if (!fontSize || !fontWeight) {
        return {
            fontHeading: "text-[28px] font-bold",
            fontCommon: "text-[24px] font-bold",
            fontCaption: "text-[20px] font-bold",
        };
    }

    const base = fontSizeClassMap[fontSize];
    const weight = fontWeightClassMap[fontWeight];

    if (!base || !weight) {
        return {
            fontHeading: "text-[28px] font-bold",
            fontCommon: "text-[24px] font-bold",
            fontCaption: "text-[20px] font-bold",
        };
    }

    return {
        fontHeading: `${base.heading} ${weight}`,
        fontCommon: `${base.common} ${weight}`,
        fontCaption: `${base.caption} ${weight}`,
    };
}
