module.exports = {
  typescript: {
    rewritePaths: {
      "src/": "lib/",
    },
    compile: false,
  },
  files: ["src/**/*.test.ts"],
  require: ["./lib/adapter/polyfills.js"],
};
