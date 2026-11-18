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

# UI5 Review Assistant – Part 1B

## 1. Project Overview

The UI5 Review Assistant is a Node.js command-line application that uses Google's Gemini AI model to review SAPUI5 source files and identify potential code issues.

It accepts one SAPUI5 JavaScript controller or XML view and checks for two categories:

1. **Hardcoded text:** User-visible text that should ideally be maintained using SAPUI5 internationalization (i18n).
2. **Missing error handling:** Operations that may fail but do not have appropriate error handling.

The application returns structured JSON findings containing the issue category, line number, severity, evidence, rationale, and suggested improvement.

The project follows a specification-driven development approach and includes automated tests, an evaluation dataset, and harness evidence.

## 2. Features

- Reviews SAPUI5 JavaScript controllers and XML views.
- Identifies hardcoded user-visible text and missing error handling.
- Uses Gemini AI for source-code analysis.
- Produces structured JSON findings with line numbers and verbatim evidence.
- Provides explanations and suggested improvements.
- Validates model responses.
- Separates service errors and invalid responses from review findings.
- Includes an 18-case evaluation dataset.
- Calculates precision, recall, F1-score, and macro-F1.
- Saves evaluation results for offline review.

## 3. Technology Stack and Development Tools

| Technology / Tool | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| JavaScript (ES Modules) | Application implementation |
| npm | Dependency management |
| Google Gemini API | AI-based source-code review |
| Gemini Flash Lite (`gemini-flash-lite-latest`) | Model used for source-code analysis |
| Google Gen AI SDK | Gemini API integration |
| ESLint | Code quality and security checks |
| Node.js Test Runner | Automated testing |
| Spec Kit | Specification-driven development |
| Gemini CLI | AI-assisted development |

**Model version history:** Earlier attempts using `gemini-1.5-flash` and `gemini-2.0-flash` failed during development because the model names were unavailable/deprecated. The implementation uses `gemini-flash-lite-latest`. Refer to Harness Log Entry 1.

## 4. Review Categories

The application supports exactly two finding categories.

| Category | Description | Example |
|---|---|---|
| `hardcoded-text` | Identifies user-visible hardcoded text that should use i18n. | `MessageToast.show("Saved successfully")` |
| `missing-error-handling` | Identifies operations that may fail without appropriate error handling. | A service operation without a catch or error callback. |

The tool identifies potential issues but does not automatically modify source code.

## 5. Project Structure

The following is a partial project structure showing the main application, evaluation, tests, and evidence directories.

```text
Part-1B/
├── src/
│   ├── cli.js
│   ├── reviewer.js
│   └── schema-validator.js
├── prompts/
│   └── system-prompt.txt
├── evals/
│   ├── eval-runner.js
│   └── dataset.json
├── tests/
│   ├── property/
│   └── structural/
├── evidence/
│   ├── initial-generation/
│   ├── pre-implementation-results/
│   ├── harness-results/
│   ├── evaluation-results.json
│   └── harness-log.md
├── .harness/
│   └── eslint.config.js
├── .specify/
│   └── memory/
│       └── constitution.md
├── package.json
├── package-lock.json
└── README.md
```

The evidence directory contains development records, harness execution results, final evaluation output, and the harness log.

## 6. Installation and Setup

### Prerequisites

- Node.js 22 or newer
- npm
- Git
- Google Gemini API key

### Development Environment

| Tool | Version |
|---|---|
| Node.js | v24.22.2 |
| npm | 11.19.1 |
| Spec Kit | 1.3.3.dev0 |

### Clone the repository

```bash
git clone https://github.com/2026ns93106APN/Assignment-1.git
cd Assignment-1/Part-1B
```

### Install dependencies

```bash
npm install
```

### Configure the Gemini API key

Create a `.env` file in the Part-1B directory:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Replace the placeholder with your own API key.

**Important:** Do not commit the `.env` file or expose the API key in source code or screenshots.

## 7. Usage

The application accepts a SAPUI5 JavaScript controller or XML view file as input.

### Run the application

From the Part-1B directory:

```bash
node src/cli.js <path-to-file>
```

Replace `<path-to-file>` with the actual path of the controller or XML view you want to review.

### Expected output

The application returns a structured JSON response containing the review status and findings.

Each finding includes:

- `category`: Type of issue identified.
- `line`: Line number where the issue occurs.
- `severity`: Severity assigned to the finding.
- `evidence`: Verbatim source-code evidence.
- `rationale`: Explanation of why the code was flagged.
- `suggestion`: Recommended improvement.

The application also distinguishes successful reviews from service errors, invalid model responses, and evaluation errors.

## 8. Evaluation

The application is evaluated using a synthetic dataset containing 18 test cases.

### 8.1 Evaluation Dataset

| Case Type | Purpose |
|---|---|
| Positive – hardcoded text | Checks identification of hardcoded user-visible text. |
| Positive – missing error handling | Checks identification of missing error handling. |
| Negative | Checks whether the tool avoids reporting findings when no issue exists. |
| Boundary | Checks behaviour in less straightforward scenarios. |
| Mixed category | Checks identification of both categories in the same file. |

### 8.2 Evaluation Metrics

The evaluation runner calculates:

- **Precision:** How many reported findings are correct.
- **Recall:** How many expected findings are identified.
- **F1-score:** Combined measure of precision and recall.
- **Macro-F1:** Average F1-score across the two supported categories.

The acceptance threshold was defined before the final evaluation.

**Acceptance criterion:** Macro-F1 must be greater than or equal to 0.70.

### 8.3 Final Evaluation Results

| Metric | Hardcoded Text | Missing Error Handling |
|---|---:|---:|
| True Positives (TP) | 6 | 6 |
| False Positives (FP) | 0 | 2 |
| False Negatives (FN) | 0 | 0 |
| Precision | 1.000 | 0.750 |
| Recall | 1.000 | 1.000 |
| F1-score | 1.000 | 0.857 |

**Overall evaluation:**

| Metric | Result |
|---|---:|
| Macro-F1 | **0.929** |
| Required threshold | 0.700 |
| Total test cases | 18 |
| Successful model responses | 16 |
| Service errors | 2 |
| Invalid model responses | 0 |
| Evaluation errors | 0 |

**Evaluation outcome: PASS**

The measured macro-F1 of 0.929 exceeds the predefined acceptance threshold of 0.70.

### 8.4 Evaluation Limitations

- Two of the 18 cases returned service errors and were not included in the finding metrics.
- Two false positives occurred in the missing-error-handling category.
- Both false positives involved `.catch(error => console.error(error))`. The dataset considers the presence of a catch block sufficient, while the model interpreted console-only logging as insufficient error handling.

These results highlight a difference between the current evaluation definition and the model's interpretation.

Evaluation results are saved in `evidence/evaluation-results.json`.

Detailed development and evaluation history is available in `evidence/harness-log.md`.

## 9. Testing and Verification

### 9.1 Running Automated Tests

Execute the configured test command:

```bash
npm test
```

### 9.2 Running the Harness

```bash
npm run harness
```

The harness performs:

1. Secret scanning.
2. ESLint security and code-quality checks.
3. Automated test execution.

### 9.3 Evaluation Runner

The evaluation runner is implemented in `evals/eval-runner.js`. It compares actual model findings against expected findings in `evals/dataset.json` and calculates the evaluation metrics.

### 9.4 Documented Security Exceptions

Two narrowly scoped ESLint security rule exceptions are approved in the project constitution (v1.1.0):

- `security/detect-non-literal-fs-filename`: Applied to files that read user-supplied or fixed fixture paths.
- `security/detect-object-injection`: Applied to a validated, bounded numeric array index in `src/schema-validator.js`.

These exceptions are documented in `.specify/memory/constitution.md`. Refer to Harness Log Entry 3 for the full rationale.

## 10. Design Considerations and Limitations

**AI-generated findings:** Findings may vary between executions and should be reviewed by a developer before making code changes.

**Service dependency:** The application requires access to the Gemini API. Service availability, API limits, and response failures can affect execution.

**Error-handling interpretation:** The model may apply a stricter interpretation than the current evaluation definition, resulting in false positives.

**Scope:** The application focuses only on hardcoded user-visible text and missing error handling. It is not intended to perform a complete SAPUI5 code review or replace manual developer reviews.

**AI-assisted development verification:** During T016 implementation, transcript review revealed that the coding agent ran tests outside its instructed scope. This was identified through independent review of the tool-call transcript rather than relying only on the agent's summary. Refer to Harness Log Entry 4.

## 11. AI Usage and Development Contributions

AI-assisted development was used as part of the specification-driven implementation process.

**Gemini CLI contributions:**

Gemini CLI assisted with generating the implementation files:

- `src/cli.js`
- `src/reviewer.js`
- `src/schema-validator.js`
- `evals/eval-runner.js`

**Developer contributions:**

The developer reviewed the generated code and made integration and implementation fixes, including:

- Adding dotenv initialization and explicit Gemini API key configuration.
- Updating the model name to `gemini-flash-lite-latest`.
- Correcting response metadata handling.
- Adding pacing between evaluation cases to reduce API rate-limit issues.
- Strengthening the prompt to require verbatim evidence.
- Reviewing test results, evaluation metrics, and false positives.
- Maintaining the evaluation criteria and making the final acceptance decision.

AI assistance was used as a development aid. Verification and final project decisions remained the developer's responsibility.

## 12. Conclusion

The UI5 Review Assistant provides an AI-assisted approach to identifying two common SAPUI5 code issues: hardcoded user-visible text and missing error handling.

The final evaluation achieved a macro-F1 score of **0.929**, exceeding the predefined acceptance threshold of 0.70.

Although service errors and false positives were observed, they were documented as limitations. Based on the acceptance criteria and recorded evaluation evidence, the implementation was accepted for the scope of this assignment.

The source code, automated tests, evaluation results, and development records are included in the project repository.