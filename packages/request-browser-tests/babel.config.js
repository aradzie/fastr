module.exports = {
  sourceType: "unambiguous",
  babelrcRoots: ["."],
  presets: [["@babel/preset-env", {}]],
  ignore: [/\/@babel\//, /\/webpack\//],
  env: {
    development: {
      compact: false,
    },
  },
};
