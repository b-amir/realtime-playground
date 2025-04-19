import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["node_modules", "dist"] },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
        ...globals.commonjs,
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^_",
          args: "after-used",
          ignoreRestSiblings: true,
          argsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          caughtErrors: "none",
          vars: "all",
        },
      ],
    },
  },
];
