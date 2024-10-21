import js from "@eslint/js";
import ava from "eslint-plugin-ava";
import node from "eslint-plugin-n";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import ts from "typescript-eslint";

export default [
  { files: ["**/*.{js,ts}"] },
  { ignores: ["**/lib/", "**/tmp/", "**/sandbox/", "**/demo/"] },
  { languageOptions: { globals: globals.node } },
  js.configs["recommended"],
  ...ts.configs["recommended"],
  node.configs["flat/recommended-script"],
  ava.configs["flat/recommended"],
  {
    rules: {
      "eqeqeq": ["error", "always", { null: "never" }],
      "no-constant-condition": ["error", { checkLoops: false }],
      "no-unused-private-class-members": "off",
      "prefer-const": "off",
      "@typescript-eslint/consistent-type-assertions": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "n/file-extension-in-import": ["error", "always"],
      "n/no-process-exit": "off",
      "n/no-unsupported-features/es-builtins": "off",
      "n/no-unsupported-features/es-syntax": "off",
      "n/no-unsupported-features/node-builtins": "off",
      "n/prefer-global/buffer": ["error", "always"],
      "n/prefer-global/console": ["error", "always"],
      "n/prefer-global/process": ["error", "always"],
      "n/prefer-global/text-decoder": ["error", "always"],
      "n/prefer-global/text-encoder": ["error", "always"],
      "n/prefer-global/url": ["error", "always"],
      "n/prefer-global/url-search-params": ["error", "always"],
      "n/prefer-node-protocol": "error",
      "n/prefer-promises/dns": "error",
      "n/prefer-promises/fs": "error",
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      },
    },
  },
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": [
        "error",
        { groups: [["^\\u0000", "^node:", "^@?\\w", "^", "^\\."]] },
      ],
      "simple-import-sort/exports": ["error"],
    },
  },
  {
    files: ["**/*.test.ts"],
    rules: {
      "n/no-extraneous-import": [
        "error",
        { allowModules: ["ava", "mockdate"] },
      ],
    },
  },
];
