import js from "@eslint/js";
import tseslint from "typescript-eslint";

/**
 * Shared ESLint flat config for Recon-OS.
 *
 * Consumed by the root `eslint.config.js`, which re-exports this module so that
 * every workspace package is linted with one configuration. Child packages do
 * not carry their own ESLint config.
 */
export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/*.config.js",
      "**/*.config.mjs",
      "**/scripts/**",
      "**/bin/**",
      "pnpm-lock.yaml",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
);
