import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";
import pluginUnusedImports from "eslint-plugin-unused-imports";

export default defineConfig([
  // Base recommended configs first
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  // React 17+ JSX runtime (disables react/react-in-jsx-scope)
  pluginReact.configs.flat["jsx-runtime"],
  // Project-specific rules last so they win
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    languageOptions: {
      globals: globals.browser,
    },
    settings: {
      react: { version: "detect" },
    },
    plugins: { "unused-imports": pluginUnusedImports },
    rules: {
      "unused-imports/no-unused-imports": "error",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "react/react-in-jsx-scope": "off",
    },
  },
]);
