import security from "eslint-plugin-security";

export default [
  security.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    }
  },
];
