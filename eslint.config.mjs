import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

export default [
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
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "prefer-const": "off",
      "no-undef": "error",
      "no-unused-vars": "off",
      "react/no-unescaped-entities": "off",
      "no-useless-escape": "off",
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "no-constant-binary-expression": "off",
    },
  },
];
