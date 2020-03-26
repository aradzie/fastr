const { join } = require("path");

module.exports = [
  {
    name: "development",
    target: "web",
    mode: "development",
    context: __dirname,
    entry: "./lib/tests.js",
    output: {
      path: join(__dirname, "lib/"),
      filename: "tests-bundle.js",
      publicPath: "/lib/",
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: "babel-loader",
        },
      ],
    },
    devtool: "source-map",
  },
  {
    name: "production",
    target: "web",
    mode: "production",
    context: __dirname,
    entry: "./lib/tests.js",
    output: {
      path: join(__dirname, "lib/"),
      filename: "tests-bundle-prod.js",
      publicPath: "/lib/",
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: "babel-loader",
        },
      ],
    },
    devtool: "source-map",
  },
  {
    name: "example",
    target: "web",
    mode: "development",
    context: __dirname,
    entry: "./lib/example.js",
    output: {
      path: join(__dirname, "lib/"),
      filename: "example-bundle.js",
      publicPath: "/lib/",
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: "babel-loader",
        },
      ],
    },
    devtool: "source-map",
  },
  {
    name: "example",
    target: "web",
    mode: "production",
    context: __dirname,
    entry: "./lib/example.js",
    output: {
      path: join(__dirname, "lib/"),
      filename: "example-bundle-prod.js",
      publicPath: "/lib/",
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: "babel-loader",
        },
      ],
    },
    devtool: "source-map",
  },
];
