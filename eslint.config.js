import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginAstro from "eslint-plugin-astro";
import stylistic from "@stylistic/eslint-plugin";
import jsdoc from "eslint-plugin-jsdoc";
import globals from "globals";

export default [
  // Global ignores
  {
    ignores: ["dist/", "node_modules/", ".astro/", "db/migrations/"],
  },

  // Base JavaScript/TypeScript recommended rules
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Global settings for all files
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // Allow unused variables prefixed with _ (common convention for intentional skips)
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  // Astro files
  ...eslintPluginAstro.configs.recommended,

  // TypeScript-specific overrides
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
    },
  },

  // TypeScript formatting rules (see .github/instructions/coding-standards.instructions.md).
  // Scoped to the app's own TypeScript source (db/, src/lib/, src/types/), which already
  // follows this convention. Root-level tool configs and e2e-tests/*.spec.ts follow their
  // own generators' conventions (2-space) and are intentionally left alone.
  {
    files: ["db/**/*.ts", "src/lib/*.ts", "src/types/*.ts"],
    plugins: { "@stylistic": stylistic },
    rules: {
      "@stylistic/indent": ["error", 4],
      "@stylistic/quotes": ["error", "single", { avoidEscape: true }],
      "@stylistic/semi": ["error", "always"],
      "@stylistic/comma-dangle": ["error", "always-multiline"],
      "@stylistic/eol-last": ["error", "always"],
      "@stylistic/no-trailing-spaces": "error",
    },
  },

  // Require TSDoc/JSDoc (description + @param + @returns) on exported functions in the
  // data layer, per .github/instructions/drizzle.instructions.md.
  {
    files: ["db/**/*.ts", "src/lib/*.ts"],
    ignores: ["**/*.test.ts"],
    plugins: { jsdoc },
    settings: {
      jsdoc: { mode: "typescript" },
    },
    rules: {
      "jsdoc/require-jsdoc": [
        "error",
        {
          publicOnly: true,
          require: { FunctionDeclaration: true, FunctionExpression: true, MethodDefinition: true },
        },
      ],
      "jsdoc/require-param": "error",
      "jsdoc/require-param-description": "error",
      "jsdoc/require-returns": "error",
      "jsdoc/require-returns-description": "error",
    },
  },
];
