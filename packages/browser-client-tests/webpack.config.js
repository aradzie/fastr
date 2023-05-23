const { join } = require("path");

const rule_ts = () => ({
  test: /\.(ts|tsx)$/,
  type: "javascript/auto",
  use: [
    {
      loader: "ts-loader",
      options: {
        transpileOnly: true,
      },
    },
  ],
});

module.exports = [
  {
    name: "test-server",
    target: "node",
    mode: "development",
    context: __dirname,
    entry: "./src/start-server.ts",
    output: {
      path: join(__dirname, "lib"),
      filename: "start-server.js",
      publicPath: "/lib/",
    },
    module: {
      rules: [rule_ts()],
    },
    optimization: { concatenateModules: true },
    devtool: "source-map",
  },
  {
    name: "test-server",
    target: "node",
    mode: "production",
    context: __dirname,
    entry: "./src/start-server.ts",
    output: {
      path: join(__dirname, "lib"),
      filename: "start-server-prod.js",
      publicPath: "/lib/",
    },
    module: {
      rules: [rule_ts()],
    },
    optimization: { concatenateModules: true },
    devtool: "source-map",
  },
  {
    name: "tests",
    target: "web",
    mode: "development",
    context: __dirname,
    entry: "./src/tests.ts",
    output: {
      path: join(__dirname, "lib"),
      filename: "tests-bundle.js",
      publicPath: "/lib/",
    },
    module: {
      rules: [rule_ts()],
    },
    optimization: { concatenateModules: true },
    devtool: "source-map",
  },
  {
    name: "tests",
    target: "web",
    mode: "production",
    context: __dirname,
    entry: "./src/tests.ts",
    output: {
      path: join(__dirname, "lib"),
      filename: "tests-bundle-prod.js",
      publicPath: "/lib/",
    },
    module: {
      rules: [rule_ts()],
    },
    optimization: { concatenateModules: true },
    devtool: "source-map",
  },
  {
    name: "example",
    target: "web",
    mode: "development",
    context: __dirname,
    entry: "./src/example.ts",
    output: {
      path: join(__dirname, "lib"),
      filename: "example-bundle.js",
      publicPath: "/lib/",
    },
    module: {
      rules: [rule_ts()],
    },
    optimization: { concatenateModules: true },
    devtool: "source-map",
  },
  {
    name: "example",
    target: "web",
    mode: "production",
    context: __dirname,
    entry: "./src/example.ts",
    output: {
      path: join(__dirname, "lib"),
      filename: "example-bundle-prod.js",
      publicPath: "/lib/",
    },
    module: {
      rules: [rule_ts()],
    },
    optimization: { concatenateModules: true },
    devtool: "source-map",
  },
];
