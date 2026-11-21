
import security from "eslint-plugin-security";

export default [
  security.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
  },

  // Approved exception: filesystem paths in CLI and known test fixtures.
  {
    files: [
      "src/cli.js",
      "src/reviewer.js",
      "tests/property/exclusions.test.js",
      "tests/property/verbatim.test.js",
      "tests/structural/dataset.test.js",
      "tests/structural/schema.test.js",
      "integration-tests/verbatim.test.js",
    ],
    rules: {
      "security/detect-non-literal-fs-filename": "off",
    },
  },

  // Approved exception: validated array access using a bounded numeric index.
  {
    files: ["src/schema-validator.js"],
    rules: {
      "security/detect-object-injection": "off",
    },
  },
];
