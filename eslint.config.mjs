import next from "eslint-config-next";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

const eslintConfig = [
  ...next,
  ...nextCoreWebVitals,
  ...nextTypescript,
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.serviceworker,
        React: "writable",
        PublicKeyCredentialDescriptor: "readonly",
        PublicKeyCredentialCreationOptions: "readonly",
        PublicKeyCredential: "readonly",
        AuthenticatorAttestationResponse: "readonly",
        AuthenticatorAttachment: "readonly",
        PublicKeyCredentialRequestOptions: "readonly",
        AuthenticatorAssertionResponse: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": ts,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "prefer-const": "off",
      "no-undef": "error",
      "no-unused-vars": "warn",
      "react/no-unescaped-entities": "off",
      "no-useless-escape": "off",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "no-constant-binary-expression": "off",
    },
  },
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"]
  }
];

export default eslintConfig;
