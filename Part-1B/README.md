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