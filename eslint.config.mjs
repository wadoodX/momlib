import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  // `.agents/` and `.claude/` hold vendored agent-skill bundles (third-party
  // scripts), not project source — keep them out of the project lint.
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", ".agents/**", ".claude/**"]),
]);
