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
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:node/recommended",
    "plugin:ava/recommended",
  ],
  rules: {
    "eqeqeq": ["error", "always", { null: "never" }],
    "no-constant-condition": ["error", { checkLoops: false }],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "node/no-unsupported-features/es-syntax": "off",
    "node/no-missing-import": "off",
    "node/no-missing-require": "off",
    "node/prefer-promises/dns": ["error"],
    "node/prefer-promises/fs": ["error"],
    "node/prefer-global/buffer": ["error", "always"],
    "node/prefer-global/console": ["error", "always"],
    "node/prefer-global/process": ["error", "always"],
    "node/prefer-global/url": ["error", "always"],
    "node/prefer-global/url-search-params": ["error", "always"],
  },
  overrides: [
    {
      files: ["*.test.ts"],
      rules: {
        "node/no-extraneous-import": [
          "error",
          { allowModules: ["ava", "mockdate"] },
        ],
      },
    },
  ],
};
