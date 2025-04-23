module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx,html}", "./dist/popup.html"],
    theme: {
        extend: {
            colors: {
                // 그레이스케일
                greyscale: {
                    100: "#FEFEFE",
                    200: "#F5F7FB",
                    300: "#EAEDF4",
                    400: "#CFD2D8",
                    500: "#8A8D93",
                    600: "#6C6E73",
                    700: "#505156",
                    800: "#323335",
                    900: "#121212",
                },
                // 퍼플
                purple: {
                    light: "#B872FF",
                    default: "#8914FF",
                    dark: "#5A0EA7",
                },
                // 옐로우
                yellow: {
                    light: "#FDDB66",
                    default: "#FDC300",
                },
                // 블루
                blue: {
                    light: "#454CEE",
                    default: "#373DCC",
                },
            },
            fontFamily: {
                koddi: ["KoddiUDOnGothic", "sans-serif"],
            },
        },
    },
    plugins: [
        function ({ addUtilities }) {
            const fontUtilities = {
                /* 32px - 2rem */
                ".font-32-XBold": {
                    "font-weight": "800",
                    "font-size": "2rem",
                    "line-height": "normal",
                },
                ".font-32-Bold": {
                    "font-weight": "700",
                    "font-size": "2rem",
                    "line-height": "normal",
                },
                ".font-32-Regular": {
                    "font-weight": "400",
                    "font-size": "2rem",
                    "line-height": "normal",
                },

                /* 30px - 1.875rem */
                ".font-30-XBold": {
                    "font-weight": "800",
                    "font-size": "1.875rem",
                    "line-height": "normal",
                },
                ".font-30-Bold": {
                    "font-weight": "700",
                    "font-size": "1.875rem",
                    "line-height": "normal",
                },
                ".font-30-Regular": {
                    "font-weight": "400",
                    "font-size": "1.875rem",
                    "line-height": "normal",
                },

                /* 28px - 1.75rem */
                ".font-28-XBold": {
                    "font-weight": "800",
                    "font-size": "1.75rem",
                    "line-height": "normal",
                },
                ".font-28-Bold": {
                    "font-weight": "700",
                    "font-size": "1.75rem",
                    "line-height": "normal",
                },
                ".font-28-Regular": {
                    "font-weight": "400",
                    "font-size": "1.75rem",
                    "line-height": "normal",
                },

                /* 26px - 1.625rem */
                ".font-26-XBold": {
                    "font-weight": "800",
                    "font-size": "1.625rem",
                    "line-height": "normal",
                },
                ".font-26-Bold": {
                    "font-weight": "700",
                    "font-size": "1.625rem",
                    "line-height": "normal",
                },
                ".font-26-Regular": {
                    "font-weight": "400",
                    "font-size": "1.625rem",
                    "line-height": "normal",
                },

                /* 24px - 1.5rem */
                ".font-24-XBold": {
                    "font-weight": "800",
                    "font-size": "1.5rem",
                    "line-height": "normal",
                },
                ".font-24-Bold": {
                    "font-weight": "700",
                    "font-size": "1.5rem",
                    "line-height": "normal",
                },
                ".font-24-Regular": {
                    "font-weight": "400",
                    "font-size": "1.5rem",
                    "line-height": "normal",
                },

                /* 22px - 1.375rem */
                ".font-22-XBold": {
                    "font-weight": "800",
                    "font-size": "1.375rem",
                    "line-height": "normal",
                },
                ".font-22-Bold": {
                    "font-weight": "700",
                    "font-size": "1.375rem",
                    "line-height": "normal",
                },
                ".font-22-Regular": {
                    "font-weight": "400",
                    "font-size": "1.375rem",
                    "line-height": "normal",
                },

                /* 20px - 1.25rem */
                ".font-20-XBold": {
                    "font-weight": "800",
                    "font-size": "1.25rem",
                    "line-height": "normal",
                },
                ".font-20-Bold": {
                    "font-weight": "700",
                    "font-size": "1.25rem",
                    "line-height": "normal",
                },
                ".font-20-Regular": {
                    "font-weight": "400",
                    "font-size": "1.25rem",
                    "line-height": "normal",
                },

                /* 18px - 1.125rem */
                ".font-18-XBold": {
                    "font-weight": "800",
                    "font-size": "1.125rem",
                    "line-height": "normal",
                },
                ".font-18-Bold": {
                    "font-weight": "700",
                    "font-size": "1.125rem",
                    "line-height": "normal",
                },
                ".font-18-Regular": {
                    "font-weight": "400",
                    "font-size": "1.125rem",
                    "line-height": "normal",
                },

                /* 16px - 1rem */
                ".font-16-XBold": {
                    "font-weight": "800",
                    "font-size": "1rem",
                    "line-height": "normal",
                },
                ".font-16-Bold": {
                    "font-weight": "700",
                    "font-size": "1rem",
                    "line-height": "normal",
                },
                ".font-16-Regular": {
                    "font-weight": "400",
                    "font-size": "1rem",
                    "line-height": "normal",
                },
            };

            addUtilities(fontUtilities);
        },
    ],
};
