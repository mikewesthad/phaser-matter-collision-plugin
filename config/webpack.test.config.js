/* eslint-env node */

const path = require("path");
const { readdirSync, statSync } = require("fs");

const root = path.resolve(__dirname, "..");
const dirs = p => readdirSync(p).filter(f => statSync(path.join(p, f)).isDirectory());

// Configure the entry with appropriate keys and values to multi-compile all tests/*/src/index.js to
// tests/*/build/index.js
const entry = {};
dirs(path.join(root, "tests"))
  .filter(folder => folder !== "assets")
  .forEach(folder => {
    // Key is the path from output path ("tests") to where the HTML & JS should go, e.g. for a path
    // of "./tests/sample-test/src/index.js", it should be "sample-test/index"
    const key = `${folder}/build/index`;
    entry[key] = `./tests/${folder}/src/index.js`;
  });

module.exports = function(env, argv) {
  const isDev = argv.mode === "development";

  return {
    entry,
    output: {
      path: path.resolve(root, "tests"),
      filename: "[name].js"
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ["babel-loader"]
        }
      ]
    },
    optimization: {
      minimize: false
    },
    devtool: isDev ? "eval-source-map" : "source-map"
  };
};
