module.exports = {
  root: true,
  env: {
    es2020: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  plugins: [
    "eslint-plugin-ava",
    // "eslint-plugin-import",
    "@typescript-eslint",
  ],
  extends: [
    "eslint:recommended",
    "plugin:ava/recommended",
    // "plugin:eslint-plugin-import/recommended",
    // "plugin:eslint-plugin-import/typescript",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  rules: {
    "no-constant-condition": ["error", { checkLoops: false }],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-use-before-define": "off",
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts"],
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        directory: "./packages/*/tsconfig.json",
      },
    },
  },
  overrides: [
    {
      files: ["*.test.ts"],
      rules: {
        "import/no-named-as-default-member": "off",
        "ava/no-ignored-test-files": "off",
      },
    },
  ],
};
