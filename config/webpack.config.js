/* eslint-env node */

const path = require("path");
const root = path.resolve(__dirname, "..");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = function (env, argv) {
  const isDev = argv.mode === "development";

  return {
    context: path.join(root, "src"),
    entry: "./index.ts",
    output: {
      filename: "[name].js",
      path: path.resolve(root, "dist"),
      library: "PhaserMatterCollisionPlugin",
      libraryTarget: "umd",
      libraryExport: "default",
      globalObject: '(typeof self !== "undefined" ? self : this)',
    },
    plugins: [new CleanWebpackPlugin()],
    externals: {
      phaser: {
        root: "Phaser",
        commonjs: "phaser",
        commonjs2: "phaser",
        amd: "phaser",
      },
    },
    module: {
      rules: [
        { test: /\.(ts|tsx)$/, use: "ts-loader", exclude: /node_modules/ },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ["babel-loader"],
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    devtool: isDev ? "eval-source-map" : "source-map",
  };
};
