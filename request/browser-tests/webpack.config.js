const { join } = require("path");

module.exports = [
  {
    name: "development",
    target: "web",
    mode: "development",
    context: __dirname,
    entry: "./build/tests.js",
    output: {
      path: join(__dirname, "build/"),
      filename: "tests-bundle.js",
      publicPath: "/build/",
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [
            {
              loader: "babel-loader",
            },
            {
              loader: "source-map-loader",
            },
          ],
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
    entry: "./build/tests.js",
    output: {
      path: join(__dirname, "build/"),
      filename: "tests-bundle-prod.js",
      publicPath: "/build/",
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [
            {
              loader: "babel-loader",
            },
            {
              loader: "source-map-loader",
            },
          ],
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
    entry: "./build/example.js",
    output: {
      path: join(__dirname, "build/"),
      filename: "example-bundle.js",
      publicPath: "/build/",
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [
            {
              loader: "babel-loader",
            },
            {
              loader: "source-map-loader",
            },
          ],
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
    entry: "./build/example.js",
    output: {
      path: join(__dirname, "build/"),
      filename: "example-bundle-prod.js",
      publicPath: "/build/",
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [
            {
              loader: "babel-loader",
            },
            {
              loader: "source-map-loader",
            },
          ],
        },
      ],
    },
    devtool: "source-map",
  },
];
