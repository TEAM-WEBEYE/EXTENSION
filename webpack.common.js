/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    plugins: [new ReactRefreshWebpackPlugin()],
    entry: {
        backgroundPage: path.join(__dirname, "src/backgroundPage.ts"),
        content: path.join(__dirname, "src/content/index.tsx"),
        iframe: path.join(__dirname, "src/iframe/index.tsx"),

    },
    output: {
        path: path.join(__dirname, "dist/js"),
        filename: "[name].js",
        clean: true,
    },
    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /\.tsx?$/,
                use: "ts-loader",
            },
            // Treat src/css/app.css as a global stylesheet
            {
                test: /\app.css$/,
                use: ["style-loader", "css-loader", "postcss-loader"],
            },
            // Load .module.css files as CSS modules
            {
                test: /\.module.css$/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            modules: true,
                        },
                    },
                    "postcss-loader",
                ],
            },
        ],
    },
    // Setup @src path resolution for TypeScript files
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
        alias: {
            "@src": path.resolve(__dirname, "src/"),
        },
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: "public/manifest.json", to: "../" },
                { from: "public/icons", to: "../icons" },
                { from: "src/iframe/iframe.html", to: "../" },

                { from: "public/images", to: "../images" },
            ],
        }),
    ],
};
