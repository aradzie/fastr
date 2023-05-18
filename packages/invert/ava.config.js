export default {
  typescript: {
    rewritePaths: {
      "src/": "lib/",
    },
    compile: false,
  },
  files: ["src/**/*.test.ts"],
  require: ["reflect-metadata"],
};
