/* eslint-env node */

const path = require("path");
const root = __dirname;

module.exports = function (env, argv) {
  const isDev = argv.mode === "development";

  return {
    context: path.join(root, "src"),
    entry: "./index.ts",
    output: {
      library: {
        name: "PhaserMatterCollisionPlugin",
        type: "umd",
      },
      filename: "phaser-matter-collision.js",
      path: path.resolve(root, "dist"),
      globalObject: '(typeof self !== "undefined" ? self : this)',
      clean: true,
    },
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
