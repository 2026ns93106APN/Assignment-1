# Data Model & Schema: UI5 Code Review Assistant

**Branch**: `001-ui5-review-assistant` | **Date**: 2026-11-13

## Core Entities & Data Structures

### 1. Review Finding
Represents a single detected issue in a UI5 controller or XML view file.
- **Fields**:
  - `category`: `string` — Must be either `"hardcoded-text"` or `"missing-error-handling"`.
  - `line`: `integer` — 1-based line number in the original input file.
  - `severity`: `string` — Must be `"low"`, `"medium"`, or `"high"`.
  - `evidence`: `string` — Verbatim snippet copied from the input file.
  - `rationale`: `string` — Explanation of why the finding was flagged.
  - `suggestion`: `string` — Concrete recommendation to resolve the issue.

### 2. Review Report
The top-level structure returned by the review tool and validation harness.
- **Fields**:
  - `status`: `string` — Run status. Allowed values: `"success"`, `"service_error"`, `"invalid_model_response"`, `"evaluation_error"`.
  - `metadata`: `object` — Execution details (e.g., timestamp, file path, model name).
  - `findings`: `array` of `Review Finding` objects.

### 3. Evaluation Dataset Case
Represents a synthetic test case defined in `evals/dataset.json`.

- **Fields**:
  - `id`: `string` — Unique test case identifier.
  - `type`: `string` — Test case classification. Allowed values:
    - `positive-hardcoded-text`
    - `positive-missing-error-handling`
    - `negative`
    - `boundary`
    - `mixed-category`
  - `file`: `string` — Source filename associated with the test case.
  - `input`: `string` — Synthetic source code or XML content to be reviewed.
  - `expectedFindings`: `array` — Predefined ground-truth findings for the test case.
  - `notes`: `string` — Additional context or explanation about the test case.
  - `testsRequirement`: `array of strings` — Requirement IDs that the test case validates.

### 4. Evaluation Result Summary
Stored in `evidence/` after running evaluation.
- **Fields**:
  - `macroF1`: `number` — Overall macro-averaged F1 score across categories.
  - `threshold`: `number` — Minimum acceptable threshold (0.70).
  - `categories`: `object` — Detailed Precision, Recall, and F1 scores for each category.
  - `cases`: `array` — Per-case execution results and match details.
