import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // The current codebase still contains a few intentionally dynamic Supabase shapes.
      "@typescript-eslint/no-explicit-any": "off",
      // Data-loading effects are a deliberate client-side pattern in this app.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/exhaustive-deps": "warn",
      // French UI copy legitimately contains apostrophes and quoted text.
      "react/no-unescaped-entities": "off",
      // Existing media URLs are handled as regular images for now; optimization is a later pass.
      "@next/next/no-img-element": "off",
      // React Compiler can be stricter than the current manual callback dependency style.
      "react-hooks/preserve-manual-memoization": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
