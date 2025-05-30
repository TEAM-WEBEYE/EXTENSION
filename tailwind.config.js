module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx,html}", "./dist/popup.html"],

    theme: {
        extend: {
            colors: {
                // 그레이스케일
                grayscale: {
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
            const fontSizes = {
                16: { px: "16px", rem: "1rem" },
                18: { px: "18px", rem: "1.125rem" },
                20: { px: "20px", rem: "1.25rem" },
                22: { px: "22px", rem: "1.375rem" },
                24: { px: "24px", rem: "1.5rem" },
                26: { px: "26px", rem: "1.625rem" },
                28: { px: "28px", rem: "1.75rem" },
                30: { px: "30px", rem: "1.875rem" },
                32: { px: "32px", rem: "2rem" },
            };

            const fontWeights = {
                Regular: "400",
                Bold: "700",
                XBold: "800",
            };

            const fontUtilities = {};

            // 모든 조합 생성
            Object.entries(fontSizes).forEach(([size, { rem }]) => {
                Object.entries(fontWeights).forEach(([weight, value]) => {
                    fontUtilities[`.font-${size}-${weight}`] = {
                        "font-weight": value,
                        "font-size": rem,
                        "line-height": "normal",
                    };
                });
            });

            addUtilities(fontUtilities);
        },
    ],
};
