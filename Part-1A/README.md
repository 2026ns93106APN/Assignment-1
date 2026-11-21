# UI5 Manifest Validator – Part 1A

## 1. Project Overview

The UI5 Manifest Validator is a Node.js command-line application that validates SAPUI5 `manifest.json` files against six predefined validation rules (R-001 to R-006).

The application supports batch processing, plain-text and JSON output, deterministic reporting, and appropriate exit-code handling.

The implementation is accompanied by automated tests, harness execution evidence, specification documents, and development records.

## 2. Features

- Validates SAPUI5 manifest configuration against six predefined validation rules.
- Supports batch processing of multiple manifest files.
- Generates plain-text and JSON validation reports.
- Detects missing properties and incorrectly typed values.
- Handles invalid JSON, empty files, duplicate paths, and invalid command-line arguments.
- Produces deterministic output for identical inputs.
- Includes performance test T015, which processes 50 copies of one fixture and checks execution against a 2-second limit on the test machine.
- Includes input-integrity test T013b, which hashes a test input file to check that validation does not modify it.
- Includes static checks for network-related module references.

## 3. Technology Stack and Development Tools

| Technology / Tool | Version | Purpose |
|---|---|---|
| Node.js | v24.22.2 | JavaScript runtime |
| npm | 11.19.1 | Dependency management |
| JavaScript (ES Modules) | — | Application implementation |
| ESLint | 9.39.5 | Code quality and linting |
| Node.js Test Runner | Built-in | Automated testing |
| Gemini CLI | 0.67.0 | AI-assisted source and test development |
| Spec Kit | 1.3.3.dev0 | Specification-driven development |

### Development Environment

- Operating system: Linux (development workspace).
- Minimum supported Node.js version: 22 or newer.
- Package installation: npm.

Node.js 22 or newer is required for the test command:

```bash
node --test "tests/**/*.test.js"
```

## 4. Validation Rules

The validator implements six predefined validation rules.

| Rule ID | Validation Target | Description |
|---|---|---|
| R-001 | `sap.app.id` | Validates the application ID. |
| R-002 | `sap.app.type` | Validates the application type against supported values: `application`, `component`, or `library`. |
| R-003 | `sap.ui5.rootView` | Validates the root view configuration. |
| R-004 | `sap.app.dataSources` | Validates the data sources configuration required by the configured models. |
| R-005 | `minUI5Version` | Validates the minimum UI5 version and its numeric format. |
| R-006 | `sap.app.i18n` | Validates the internationalization configuration. |

The implementation also handles missing properties and incorrectly typed values as covered by the corresponding tests.

## 5. Project Structure

The following is a partial project structure showing the main application, specification, and evidence directories.

```text
Assignment-1/
│
├── Part-1A/
│   ├── src/
│   │   ├── cli.js
│   │   ├── rules.js
│   │   └── validator.js
│   │
│   ├── tests/
│   │   └── validator.test.js
│   │
│   ├── .harness/
│   │   ├── eslint.config.js
│   │   └── run-harness.js
│   │
│   ├── evidence/
│   │   ├── initial-generation/
│   │   ├── final-generation/
│   │   ├── pre-implementation-results/
│   │   ├── harness-run-1/
│   │   ├── harness-run-2/
│   │   ├── harness-run-3-final/
│   │   ├── failure-evidence-1.md
│   │   ├── harness-log.md
│   │   ├── self-check-lint.txt
│   │   └── integrity-check.txt
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
│
├── .specify/
├── specs/
└── README.md
```

The evidence directory contains development-generation records, pre-implementation results, harness execution records, failure evidence, and final verification logs.

## 6. Installation and Setup

### Prerequisites

- Node.js 22 or newer.
- npm.
- Git.

### Clone the repository

The GitHub repository is publicly accessible.

Clone it into a directory named `Assignment-1`:

```bash
git clone https://github.com/2026ns93106APN/Assignment-1.git
```

Navigate to Part-1A:

```bash
cd Assignment-1/Part-1A
```

Install dependencies:

```bash
npm install
```

## 7. Usage

The validator accepts one or more manifest file paths as command-line arguments.

### Plain-text output

```bash
node src/cli.js tests/fixtures/valid.json
```

### Batch processing

Multiple manifest files can be validated in a single execution.

```bash
node src/cli.js tests/fixtures/valid.json tests/fixtures/invalid-r001.json
```

### JSON output

Use the `--json` option to generate structured JSON validation results.

```bash
node src/cli.js --json tests/fixtures/valid.json
```

### Batch processing with JSON output

```bash
node src/cli.js --json tests/fixtures/valid.json tests/fixtures/invalid-r001.json
```

## 8. Exit Codes

The CLI uses the following exit codes to communicate execution results.

| Exit Code | Meaning |
|---|---|
| 0 | All input files passed validation. |
| 1 | One or more manifest validation failures occurred. |
| 2 | Usage or input errors occurred, including invalid JSON or invalid arguments. |

When both validation failures and usage errors occur, exit code 2 takes precedence over exit code 1.

This behavior is covered by the automated exit-code precedence test.

## 9. Testing and Verification

The project includes automated tests for validation rules, command-line behavior, output formats, error handling, deterministic output, input integrity, and performance.

### 9.1 Running the automated harness

Execute the following command from the `Part-1A` directory:

```bash
npm run harness
```

The harness executes three checks:

1. Secret scanning.
2. ESLint security and code-quality checks.
3. Automated test execution.

### 9.2 Test coverage

The automated test suite covers:

- R-001 through R-006 validation.
- Batch file processing.
- Plain-text output.
- JSON output.
- Exit-code handling.
- Duplicate path handling.
- Invalid JSON and empty files.
- Unknown command-line flags.
- Exit-code precedence.
- Deterministic output.
- Rule ordering.
- JSON response structure.
- Input integrity through file hashing (T013b).
- Static source checks for network-related modules (T013b).
- Performance validation for 50 copies of one fixture within a 2-second limit on the test machine (T015).

### 9.3 Verification results and evidence sources

| Verification Activity | Result | Evidence Source |
|---|---|---|
| Secret scanning | PASS | Automated harness |
| ESLint security check | PASS | Automated harness |
| Automated tests | PASS | Automated harness |
| Dependency installation | PASS | Manual verification |
| npm audit | 0 vulnerabilities | Manual verification |
| ESLint negative self-check | Expected failure confirmed | Manual verification |

The distinction between automated harness checks and independent manual verification is intentional.

The fresh-clone verification result must correspond to the submitted repository commit. The commit SHA used for the final fresh-clone verification should be recorded in `evidence/harness-log.md`.

### 9.4 Fresh-clone verification

The public GitHub repository was cloned into a fresh temporary directory to verify that the project could be installed and executed independently of the original development workspace.

Commands executed:

```bash
cd /tmp
rm -rf fresh

git clone https://github.com/2026ns93106APN/Assignment-1.git fresh

cd fresh/Part-1A

npm install
npm run harness
```

Expected harness output:

```text
PASS  secret-scan
PASS  lint-security
PASS  tests
```

Dependency installation completed successfully, and npm reported zero vulnerabilities.

### 9.5 ESLint negative self-check

An intentionally invalid JavaScript file containing an unused variable was temporarily created to verify that ESLint detects lint violations.

The command was executed with `--max-warnings 0`.

ESLint correctly reported a `no-unused-vars` error and returned exit code 1.

The temporary file was removed after the test.

Evidence is available in:

```text
evidence/self-check-lint.txt
```

This is an intentional negative self-check, not a failure of the final project lint gate.

## 10. Design Considerations and Limitations

### Deterministic execution

Identical inputs produce identical validation results. This behavior is covered by the FR-008 automated tests.

### Input integrity

Test T013b hashes a test input file to check that the validator does not modify it during processing. This is a test-specific verification rather than proof covering every possible input.

### Hermetic execution

The implementation uses local file processing. Test T013b includes a static source-text check for network-related modules.

This static check does not independently prove the absence of all possible runtime network activity.

### Constitution compliance

The implementation follows the project constitution, version 1.2.0.

Principle III contains a scoped exception for the ESLint rule `security/detect-non-literal-fs-filename` in `src/validator.js`, permitting the file-path handling required for input manifest processing.

This exception is limited to that specific rule and file. The rule-disabling policy otherwise remains applicable, and no broader relaxation of the constitution's security requirements is intended.

### Performance

Test T015 processes 50 copies of a single fixture and checks the execution time against a 2-second threshold on the test machine. The result should be interpreted in the context of that test environment.

## 11. AI Usage and Development Contributions

AI-assisted development was used as part of the specification-driven implementation process.

### Gemini CLI contributions

Gemini CLI (v0.67.0) was used to generate:

- The initial source-code implementation in `src/`, covering `cli.js`, `rules.js`, and `validator.js`.
- The initial drafts of the automated tests.
- Repair edits to `src/rules.js` and `src/cli.js` during implementation and verification.

Spec Kit (v1.3.3.dev0) was used as part of the specification-driven development workflow.

### AI assistant contributions

An AI assistant also helped with:

- Planning the implementation and verification workflow.
- Reviewing test coverage and validation results.
- Reviewing the README and submission documentation.
- Identifying potential inaccuracies and gaps in the evidence presentation.

### Developer contributions

The following activities were completed by the developer:

- Reviewing and evaluating generated implementation results.
- Preparing the harness execution log.
- Writing the development reflection.
- Reviewing test and verification evidence.
- Making implementation acceptance and rejection decisions.
- Performing final verification activities.
- Preparing and reviewing the submission documentation.

AI assistance was used as a development aid, with verification and final project decisions remaining the developer's responsibility.

## 12. Conclusion

Part-1A implements a command-line SAPUI5 manifest validator with six validation rules, batch processing, plain-text and JSON reporting, and defined exit-code behavior.

The implementation was evaluated through automated validation tests, security and lint checks, input-integrity checks, and a 50-file performance test.

Independent fresh-clone verification confirmed that the repository could be installed and that all three harness checks passed in a clean environment.

The accompanying evidence and development logs document the implementation and verification process.