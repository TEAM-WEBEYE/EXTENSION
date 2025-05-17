import React from "react";
import { createRoot } from "react-dom/client";
import { ControlImage } from "../../components/imageCheck/controlImage";

export const isIgnorableImage = (img: HTMLImageElement): boolean => {
    const alt = img.alt?.toLowerCase();
    const className = img.className?.toLowerCase();
    const src = img.src?.toLowerCase();
    const anchor = img.closest("a");
    const isLinked = !!(anchor && anchor.href && anchor.href !== "#");

    return (
        isLinked ||
        alt.includes("logo") ||
        alt.includes("coupang") ||
        className.includes("logo") ||
        className.includes("icon") ||
        src.includes("logo") ||
        src.includes("sprite") ||
        img.width < 40 ||
        img.height < 40
    );
};

export const processImages = () => {
    document.querySelectorAll("img").forEach((img) => {
        if (img.getAttribute("data-webeye-injected") === "true") return;
        if (isIgnorableImage(img)) return;

        img.setAttribute("data-webeye-injected", "true");

        const container = document.createElement("div");
        document.body.appendChild(container);

        const root = createRoot(container);
        root.render(<ControlImage targetImg={img} />);
    });
};
