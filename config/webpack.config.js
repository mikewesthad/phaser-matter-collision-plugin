/* eslint-env node */

const path = require("path");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const root = path.resolve(__dirname, "..");

module.exports = function(env, argv) {
  const isDev = argv.mode === "development";

  return {
    context: path.join(root, "src"),
    entry: {
      "phaser-matter-collision-plugin": "./index.ts",
      "phaser-matter-collision-plugin.min": "./index.ts"
    },
    output: {
      filename: "[name].js",
      path: path.resolve(root, "dist"),
      library: "PhaserMatterCollisionPlugin",
      libraryTarget: "umd",
      libraryExport: "default"
    },
    optimization: {
      minimizer: [new UglifyJsPlugin({ include: /\.min\.js$/, sourceMap: true })]
    },
    externals: {
      phaser: {
        root: "Phaser",
        commonjs: "phaser",
        commonjs2: "phaser",
        amd: "phaser"
      }
    },
    module: {
      rules: [
        { test: /\.(ts|tsx)$/, use: "ts-loader", exclude: /node_modules/ },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ["babel-loader"]
        }
      ]
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"]
    },
    devtool: isDev ? "eval-source-map" : "source-map"
  };
};
