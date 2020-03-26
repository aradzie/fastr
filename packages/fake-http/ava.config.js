module.exports = {
  typescript: {
    rewritePaths: {
      "src/": "lib/",
    },
    compile: false,
  },
  files: ["src/**/*.test.ts"],
};
