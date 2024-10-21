import { join } from "node:path";

const rule_ts = () => ({
  test: /\.(ts|tsx)$/,
  type: "javascript/auto",
  use: [
    {
      loader: "ts-loader",
      options: {
        transpileOnly: true,
        compilerOptions: {
          target: "es2022",
          module: "es2022",
          moduleResolution: "bundler"
        },
      },
    },
  ],
});

export default [
  {
    name: "test-server",
    target: "node",
    mode: "development",
    context: import.meta.dirname,
    entry: "./src/start-server.ts",
    output: {
      path: join(import.meta.dirname, "lib"),
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
    context: import.meta.dirname,
    entry: "./src/start-server.ts",
    output: {
      path: join(import.meta.dirname, "lib"),
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
    context: import.meta.dirname,
    entry: "./src/tests.ts",
    output: {
      path: join(import.meta.dirname, "lib"),
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
    context: import.meta.dirname,
    entry: "./src/tests.ts",
    output: {
      path: join(import.meta.dirname, "lib"),
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
    context: import.meta.dirname,
    entry: "./src/example.ts",
    output: {
      path: join(import.meta.dirname, "lib"),
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
    context: import.meta.dirname,
    entry: "./src/example.ts",
    output: {
      path: join(import.meta.dirname, "lib"),
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
