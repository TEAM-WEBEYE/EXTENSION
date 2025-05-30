import React from "react";
import { useTheme } from "@src/contexts/ThemeContext";

interface DetailFloatingProps {
    width?: number;
    height?: number;
    strokeWidth?: number;
}

export const DetailFloating: React.FC<DetailFloatingProps> = ({
    width = 32,
    height = 32,
    strokeWidth = 2.6,
}) => {
    const { theme } = useTheme();
    const isDarkMode = theme === "dark";

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            viewBox="0 0 32 32"
            fill="none"
        >
            <path
                d="M15.2 28.7972H7.19999C5.43267 28.7972 3.99999 27.3645 4 25.5972L4.00012 6.39725C4.00014 4.62994 5.43282 3.19727 7.20012 3.19727H21.6005C23.3678 3.19727 24.8005 4.62995 24.8005 6.39727V12.7973M26.4 26.3973L28 27.9973M9.6005 9.59727H19.2005M9.6005 14.3973H19.2005M9.6005 19.1973H14.4005M27.2 23.1973C27.2 25.4064 25.4091 27.1973 23.2 27.1973C20.9909 27.1973 19.2 25.4064 19.2 23.1973C19.2 20.9881 20.9909 19.1973 23.2 19.1973C25.4091 19.1973 27.2 20.9881 27.2 23.1973Z"
                stroke={isDarkMode ? "#323335" : "#fefefe"}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};
