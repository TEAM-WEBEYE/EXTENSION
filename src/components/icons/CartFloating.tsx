import { useTheme } from "@src/contexts/ThemeContext";
import React from "react";

interface CartFloatingProps {
    width?: number;
    height?: number;
}

const CartFloating: React.FC<CartFloatingProps> = ({
    width = 38,
    height = 38,
}) => {
    const { theme } = useTheme();
    const isDarkMode = theme === "dark";

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            viewBox="0 0 38 38"
            fill="none"
        >
            <path
                d="M8.55078 15.2366L16.1996 6.8924C17.7057 5.24941 20.2959 5.24941 21.802 6.8924L29.4508 15.2366M33.5635 17.2901L29.2378 31.2234C29.0321 31.8859 28.4192 32.3373 27.7256 32.3373H10.3804C9.69031 32.3373 9.07967 31.8903 8.87113 31.2324L4.45435 17.2991C4.13075 16.2783 4.89277 15.2373 5.96366 15.2373H32.0513C33.1183 15.2373 33.8798 16.2711 33.5635 17.2901Z"
                stroke={isDarkMode ? "#323335" : "#fefefe"}
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default CartFloating;
