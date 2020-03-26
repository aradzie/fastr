const { join } = require("path");

module.exports = {
  target: "web",
  mode: "production",
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
  optimization: {
    minimize: false,
    namedModules: true,
    namedChunks: true,
  },
  performance: {
    hints: false,
    maxAssetSize: 1048576,
    maxEntrypointSize: 1048576,
  },
};
