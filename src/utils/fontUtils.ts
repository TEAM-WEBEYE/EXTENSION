import type { FontSize, FontWeight } from "@src/contexts/ThemeContext";

export const fontSizeClassMap: Record<
    FontSize,
    { heading: string; common: string; caption: string }
> = {
    xl: {
        heading: "text-[32px] md:text-[32px] sm:text-[28px]",
        common: "text-[28px] md:text-[28px] sm:text-[24px]",
        caption: "text-[24px] md:text-[24px] sm:text-[20px]",
    },
    l: {
        heading: "text-[30px] md:text-[30px] sm:text-[26px]",
        common: "text-[26px] md:text-[26px] sm:text-[22px]",
        caption: "text-[22px] md:text-[22px] sm:text-[18px]",
    },
    m: {
        heading: "text-[28px] md:text-[28px] sm:text-[24px]",
        common: "text-[24px] md:text-[24px] sm:text-[20px]",
        caption: "text-[20px] md:text-[20px] sm:text-[16px]",
    },
    s: {
        heading: "text-[26px] md:text-[26px] sm:text-[22px]",
        common: "text-[22px] md:text-[22px] sm:text-[18px]",
        caption: "text-[18px] md:text-[18px] sm:text-[14px]",
    },
    xs: {
        heading: "text-[24px] md:text-[24px] sm:text-[20px]",
        common: "text-[20px] md:text-[20px] sm:text-[16px]",
        caption: "text-[16px] md:text-[16px] sm:text-[12px]",
    },
};

export const fontWeightClassMap: Record<FontWeight, string> = {
    xbold: "font-extrabold",
    bold: "font-bold",
    regular: "font-normal",
};

export function getFontClasses(fontSize: FontSize, fontWeight: FontWeight) {
    const base = fontSizeClassMap[fontSize];
    const weight = fontWeightClassMap[fontWeight];
    return {
        fontHeading: `${base.heading} ${weight}`,
        fontCommon: `${base.common} ${weight}`,
        fontCaption: `${base.caption} ${weight}`,
    };
}
