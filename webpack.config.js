const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

module.exports = {
    mode: "production",
    entry: "./src/index.ts",
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "dist/"),
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "Backstab Check Visualizer",
            filename: "index.html",
            template: "src/index.ejs",
        }),
        new MiniCssExtractPlugin(),
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/i,
                loader: "ts-loader",
                exclude: /node_modules/,
                options: {
                    compilerOptions: {
                        noEmit: "false",
                    },
                },
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
};
