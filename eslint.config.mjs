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
      /**
       * Design-system anti-pattern rules (see DESIGN_SYSTEM.md §7).
       *
       * These rules warn when forbidden patterns are used directly in JSX className
       * string literals. They do NOT catch patterns inside cn() calls or template
       * literals — those are covered by code review and the phased refactor roadmap.
       */
      "no-restricted-syntax": [
        "warn",
        // §2 Typography — ban arbitrary pixel font sizes; use text-xs / text-label instead
        {
          "selector": "JSXAttribute[name.name='className'] > Literal[value=/text-\\[(8|9|10|11|15)px\\]/]",
          "message": "[DS §2] Forbidden arbitrary font size. Use `text-xs` (body) or `text-label` (micro-label) instead. See DESIGN_SYSTEM.md §2."
        },
        // §5 Spacing — ban non-standard nav-clearance bottom padding
        {
          "selector": "JSXAttribute[name.name='className'] > Literal[value=/(^|\\s)(pb-20|pb-28|pb-32|pb-safe)(\\s|$)/]",
          "message": "[DS §5] Use `pb-24` for mobile nav clearance. pb-20, pb-28, pb-32, pb-safe are non-standard. See DESIGN_SYSTEM.md §5."
        },
        // §4 FAB — ban hardcoded literal color FABs (bg-purple-600, bg-blue-600)
        {
          "selector": "JSXAttribute[name.name='className'] > Literal[value=/bg-(purple|blue|green|pink|orange|indigo|cyan|violet|fuchsia)-[0-9]+/]",
          "message": "[DS §4] Forbidden literal color on interactive element. Use semantic tokens: bg-primary, bg-destructive, bg-success. See DESIGN_SYSTEM.md §4."
        },
        // §2 Typography — ban arbitrary tracking values (tracking-[0.Xem])
        {
          "selector": "JSXAttribute[name.name='className'] > Literal[value=/tracking-\\[[^\\]]+\\]/]",
          "message": "[DS §2] Forbidden arbitrary tracking value. Use `tracking-widest` for micro-labels or `tracking-tight` for headings. See DESIGN_SYSTEM.md §2."
        }
      ],
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
