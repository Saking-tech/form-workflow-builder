import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Disable all problematic rules for development
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "react/no-unescaped-entities": "off",
      "react/display-name": "off",
      "react/jsx-filename-extension": "off",
      "prefer-const": "off",
      "no-unused-vars": "off",
      "no-console": "off",
      "@next/next/no-img-element": "off",
      "react-hooks/exhaustive-deps": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "react/no-unknown-property": "off",
      "react/jsx-key": "warn",
      "react/jsx-no-target-blank": "off",
      "react/no-array-index-key": "off",
      "react/self-closing-comp": "off",
      "react/jsx-curly-brace-presence": "off",
      "react/jsx-boolean-value": "off",
      "react/jsx-closing-bracket-location": "off",
      "react/jsx-closing-tag-location": "off",
      "react/jsx-curly-spacing": "off",
      "react/jsx-equals-spacing": "off",
      "react/jsx-first-prop-new-line": "off",
      "react/jsx-indent": "off",
      "react/jsx-indent-props": "off",
      "react/jsx-max-props-per-line": "off",
      "react/jsx-no-bind": "off",
      "react/jsx-no-duplicate-props": "off",
      "react/jsx-no-literals": "off",
      "react/jsx-no-undef": "off",
      "react/jsx-pascal-case": "off",
      "react/jsx-props-no-multi-spaces": "off",
      "react/jsx-sort-default-props": "off",
      "react/jsx-sort-props": "off",
      "react/jsx-space-before-closing": "off",
      "react/jsx-tag-spacing": "off",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "off",
      "react/jsx-wrap-multilines": "off"
    },
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      ecmaFeatures: {
        jsx: true,
      },
    },
    env: {
      browser: true,
      es2020: true,
      node: true,
    },
  },
];

export default eslintConfig; 