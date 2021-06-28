/* eslint-env node */

const webpack = require("webpack");
const path = require("path");
const root = path.resolve(__dirname);
const HTMLWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = function (env, argv) {
  const isDev = argv.mode === "development";

  return {
    context: path.join(root, "src"),
    entry: "./index.ts",
    output: {
      filename: "index.js",
      path: path.resolve(__dirname, "dist"),
    },
    module: {
      rules: [{ test: /\.(ts|tsx)$/, use: "ts-loader", exclude: /node_modules/ }],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    plugins: [
      new HTMLWebpackPlugin({ template: "./index.html" }),
      new CopyWebpackPlugin({
        patterns: [{ from: "assets", to: "assets" }],
      }),
      new webpack.DefinePlugin({
        "typeof CANVAS_RENDERER": JSON.stringify(true),
        "typeof WEBGL_RENDERER": JSON.stringify(true),
        PRODUCTION: !isDev,
      }),
    ],
    devtool: isDev ? "eval-source-map" : "source-map",
  };
};
