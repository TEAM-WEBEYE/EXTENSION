const webpack = require("webpack");
const path = require("path");

module.exports = {
    stories: ["../src/**/*.stories.tsx"],
    staticDirs: ["../public"],
    typescript: {
        reactDocgen: false,
    },
    addons: [
        "@storybook/addon-essentials",
        "@storybook/addon-interactions",
        "@storybook/addon-webpack5-compiler-babel",
        "@chromatic-com/storybook",
    ],
    features: {
        interactionsDebugger: true,
    },
    webpackFinal: async (config) => {
        config.resolve = {
            ...config.resolve,
            extensions: [".ts", ".tsx", ".js"],
            alias: {
                "@src": path.resolve(__dirname, "../src/"),
                react: path.resolve(__dirname, "../node_modules/react"),
                "react-dom": path.resolve(
                    __dirname,
                    "../node_modules/react-dom",
                ),
                "react-dom/client": path.resolve(
                    __dirname,
                    "../node_modules/react-dom/client",
                ),
                "react-dom/test-utils": path.resolve(
                    __dirname,
                    "../node_modules/react-dom/test-utils",
                ),
                "react/jsx-runtime": path.resolve(
                    __dirname,
                    "../node_modules/react/jsx-runtime",
                ),
            },
        };

        config.plugins = [
            ...config.plugins,
            new webpack.NormalModuleReplacementPlugin(
                /webextension-polyfill/,
                (resource) => {
                    const absRootMockPath = path.resolve(
                        __dirname,
                        "../src/__mocks__/webextension-polyfill.ts",
                    );
                    const relativePath = path.relative(
                        resource.context,
                        absRootMockPath,
                    );
                    resource.request =
                        process.platform === "win32"
                            ? "./" + relativePath
                            : relativePath;
                },
            ),
        ];

        config.module.rules = config.module.rules.filter(
            (rule) =>
                !(
                    rule.test &&
                    rule.test instanceof RegExp &&
                    rule.test.test("test.css")
                ),
        );

        config.module.rules.push({
            test: /\.css$/,
            use: [
                "style-loader",
                "css-loader",
                {
                    loader: "postcss-loader",
                    options: {
                        postcssOptions: {
                            plugins: [
                                require("tailwindcss"),
                                require("autoprefixer"),
                            ],
                        },
                    },
                },
            ],
        });

        config.module.rules.push({
            test: /\.(ts|tsx)$/,
            loader: require.resolve("babel-loader"),
            options: {
                presets: [
                    ["@babel/preset-env", { targets: { node: "current" } }],
                    "@babel/preset-typescript",
                    "@babel/preset-react",
                ],
            },
        });

        return config;
    },
    framework: {
        name: "@storybook/react-webpack5",
        options: {},
    },
    docs: {
        autodocs: true,
    },
};
