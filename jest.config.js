/** @type {import('jest').Config} */
module.exports = {
    roots: ["<rootDir>/src"],
    testEnvironment: "jsdom",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest",
    },
    moduleNameMapper: {
        "^@src/(.*)$": "<rootDir>/src/$1",

        "\\.module\\.(css|less|scss|sass)$": "identity-obj-proxy",
    },
    testPathIgnorePatterns: ["/node_modules/", "stories.tsx"],
    coverageReporters: ["json", "lcov", "text", "json-summary"],
    setupFiles: ["./src/__mocks__/chrome.ts"],
};
