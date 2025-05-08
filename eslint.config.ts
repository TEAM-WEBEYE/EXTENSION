import tseslint from "typescript-eslint";
import prettier from "eslint-plugin-prettier";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: "module",
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                document: "readonly",
                window: "readonly",
            },
        },
        plugins: {
            "@typescript-eslint": tseslint.plugin,
            react,
            "react-hooks": reactHooks,
            prettier,
        },
        rules: {
            "react/react-in-jsx-scope": "off",
            "no-eval": "error",
            "no-implied-eval": "error",
            "no-console": ["warn", { allow: ["error", "warn"] }],
            "@typescript-eslint/no-unused-vars": [
                "warn",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
            ],
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-explicit-any": "warn",
            "prettier/prettier": "warn",
        },
        settings: {
            react: {
                version: "detect",
            },
        },
    },

    {
        files: [
            "src/background.ts",
            "src/backgroundPage.ts",
            "src/background/**/*.ts",
            "src/background/**/*.js",
            "background.ts",
            "backgroundPage.ts",
            "background/**/*.ts",
            "background/**/*.js",
        ],
        languageOptions: {
            globals: {
                chrome: "readonly",
                browser: "readonly",
            },
        },
        rules: {
            "no-restricted-globals": "off",
        },
    },

    {
        files: [
            "src/content/**/*.ts",
            "src/content/**/*.tsx",
            "src/content/**/*.js",
            "src/content/**/*.jsx",
            "content/**/*.ts",
            "content/**/*.tsx",
            "content/**/*.js",
            "content/**/*.jsx",
        ],
        languageOptions: {
            globals: {
                chrome: "readonly",
                browser: "readonly",
            },
        },
        rules: {
            "no-restricted-globals": "off",

            // "no-restricted-properties": [
            //     "error",
            //     {
            //         object: "chrome",
            //         property: "tabs",
            //         message:
            //             "chrome.tabs API는 백그라운드 스크립트에서만 사용하세요",
            //     },
            //     {
            //         object: "chrome",
            //         property: "storage",
            //         message:
            //             "chrome.storage API는 백그라운드 스크립트에서만 사용하세요",
            //     },
            //     {
            //         object: "chrome",
            //         property: "scripting",
            //         message:
            //             "chrome.scripting API는 백그라운드 스크립트에서만 사용하세요",
            //     },
            //     {
            //         object: "browser",
            //         property: "tabs",
            //         message:
            //             "browser.tabs API는 백그라운드 스크립트에서만 사용하세요",
            //     },
            //     {
            //         object: "browser",
            //         property: "storage",
            //         message:
            //             "browser.storage API는 백그라운드 스크립트에서만 사용하세요",
            //     },
            //     {
            //         object: "browser",
            //         property: "scripting",
            //         message:
            //             "browser.scripting API는 백그라운드 스크립트에서만 사용하세요",
            //     },
            // ],
        },
    },

    {
        files: [
            "src/popup/**/*.ts",
            "src/popup/**/*.tsx",
            "src/options/**/*.ts",
            "src/options/**/*.tsx",
            "popup/**/*.ts",
            "popup/**/*.tsx",
            "options/**/*.ts",
            "options/**/*.tsx",
        ],
        languageOptions: {
            globals: {
                chrome: "readonly",
                browser: "readonly",
            },
        },
        rules: {
            "no-restricted-globals": "off",

            "no-restricted-properties": [
                "error",
                {
                    object: "chrome",
                    property: "scripting",
                    message:
                        "chrome.scripting API는 백그라운드 스크립트에서만 사용하세요",
                },
                {
                    object: "browser",
                    property: "scripting",
                    message:
                        "browser.scripting API는 백그라운드 스크립트에서만 사용하세요",
                },
            ],
        },
    },

    {
        files: ["**/*.stories.tsx"],
        rules: {
            "@typescript-eslint/explicit-module-boundary-types": "off",
        },
    },

    {
        files: [
            "**/*.test.ts",
            "**/*.test.tsx",
            "**/*.spec.ts",
            "**/*.spec.tsx",
        ],
        languageOptions: {
            globals: {
                jest: "readonly",
                expect: "readonly",
                describe: "readonly",
                it: "readonly",
                test: "readonly",
                beforeEach: "readonly",
                afterEach: "readonly",
                beforeAll: "readonly",
                afterAll: "readonly",
            },
        },
    },
];
