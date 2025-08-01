export const detectCategoryType = ():
    | "food"
    | "cosmetic"
    | "health"
    | "none"
    | null => {
    const breadcrumbEl = document.querySelector(".breadcrumb, #breadcrumb");
    if (!breadcrumbEl) {
        return null;
    }

    const rawText = breadcrumbEl.textContent || "";
    const cleanedText = rawText.replace(/\s+/g, "");

    if (cleanedText.includes("식품") && !cleanedText.includes("건강식품")) {
        return "food";
    }

    if (cleanedText.includes("뷰티")) {
        return "cosmetic";
    }

    if (
        cleanedText.includes("건강") &&
        !cleanedText.includes("건강가전") &&
        !cleanedText.includes("건강도서")
    ) {
        return "health";
    }

    return "none";
};
