import React, { useEffect } from "react";
import { useTheme } from "@src/contexts/ThemeContext";

interface ToastProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
}

export function Toast({ message, isVisible, onClose }: ToastProps) {
    const { theme, fontClasses } = useTheme();
    const isDarkMode = theme === "dark";

    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <div
            className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-8 py-4 rounded-full shadow-lg text-xl font-bold ${fontClasses.fontHeading} ${
                isDarkMode
                    ? "bg-purple-light text-grayscale-100"
                    : "bg-purple-default text-grayscale-100"
            }`}
        >
            {message}
        </div>
    );
}
