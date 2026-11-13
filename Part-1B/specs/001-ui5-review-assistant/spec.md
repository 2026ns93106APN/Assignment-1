# Feature Specification: UI5 Code Review Assistant

**Feature Branch**: `001-ui5-review-assistant`

**Created**: 2026-11-13

**Status**: Draft

**Input**: User description: "ui5-review-assistant is a Node.js ES-module command-line tool. It reads one UI5 controller (.js) or XML view file, sends its content to a Gemini model, and returns structured review findings in a fixed JSON schema. It checks two categories only: hardcoded user-visible text that should use i18n, and missing error handling. Each finding must include the category, the line number, severity, the evidence copied verbatim from the input, a rationale and a suggestion. Describe WHAT and WHY only; do not choose technology beyond what the constitution states."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Review UI5 Controller or XML View for i18n and Error Handling (Priority: P1)

As a developer maintaining SAP UI5 applications, I want to submit a single UI5 controller script or XML view file to an automated review tool so that I can quickly identify hardcoded user-visible text lacking localization (i18n) and identify missing error handling.

**Why this priority**: This is the core value proposition of the tool, enabling developers to catch localization gaps and robust error handling omissions in a single command.

**Independent Test**: Can be fully tested by providing a sample UI5 controller or XML view file containing hardcoded text and unhandled asynchronous/synchronous operations, running the review command, and verifying that structured findings are correctly returned.

**Acceptance Scenarios**:

1. **Given** a UI5 controller or XML view file containing hardcoded user-visible strings, **When** the review tool processes the file, **Then** it returns structured findings identifying each hardcoded text occurrence with category, line number, severity, verbatim evidence, rationale, and suggestion.
2. **Given** a UI5 controller or XML view file lacking proper error handling, **When** the review tool processes the file, **Then** it returns structured findings identifying missing error handling with category, line number, severity, verbatim evidence, rationale, and suggestion.

---

### User Story 2 - Structured JSON Schema Output (Priority: P2)

As a developer or automated CI pipeline, I want the review findings returned in a strict, fixed JSON schema so that findings can be reliably parsed and integrated into reporting workflows.

**Why this priority**: A fixed JSON schema guarantees machine-readability and seamless integration with downstream reporting or quality gating tools.

**Independent Test**: Can be fully tested by validating the output JSON structure against the mandatory schema definition across various input files.

**Acceptance Scenarios**:

1. **Given** a successful file review process, **When** findings are generated, **Then** the output strictly adheres to the fixed JSON schema containing category, line number, severity, verbatim evidence, rationale, and suggestion for every finding.

### Edge Cases

- What happens when an input file is empty or contains malformed syntax? The tool returns an appropriate non-zero exit or structured error response.
- What happens when a file contains neither hardcoded text nor missing error handling? The tool returns an empty findings list adhering to the schema.
- What happens if the model service experiences connectivity issues or rate limits? The failure is isolated and reported clearly without crashing application logic.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST accept a single UI5 controller (.js) or XML view file as input.

- **FR-002**: The system MUST analyze the input content specifically for two categories: hardcoded user-visible text requiring i18n, and missing error handling.

- **FR-003**: Each review finding MUST include category, line number, severity, verbatim evidence copied from the input, rationale, and a concrete suggestion.

- **FR-004**: The system MUST output all review findings in a strict, fixed JSON schema.

- **FR-005**: The system MUST isolate and separately report model or service connection failures (such as timeouts or rate limits).

- **FR-006**: JSON Output Schema: The output JSON schema MUST include a top-level run status (status string with the following allowed values: "success", "service_error", "invalid_model_response", or "evaluation_error"), metadata, and a findings array.

Each finding object MUST contain:

category: string (allowed values: "hardcoded-text" or "missing-error-handling").

line: integer representing the 1-based line number in the original input file.

severity: string (allowed values: "low", "medium", or "high").

evidence: string containing a verbatim snippet from the input file.

rationale: string explaining why the finding was flagged.

suggestion: string containing an actionable recommendation to resolve the issue.

- **FR-007**: Evidence and Line Number Validation: The reported evidence MUST be copied verbatim from the input file. The reported line MUST accurately refer to the corresponding line number in the original input file.

- **FR-008**: Category Definitions and Scope Boundaries:

Hardcoded user-visible text requiring i18n: User-facing text strings displayed in UI components, including labels, button texts, titles, dialog messages, table headers, tooltips, and other visible messages, that are hardcoded literals instead of referencing an i18n resource.

Missing error handling: Operations that may fail, including asynchronous operations such as Promises, fetch requests, OData/API calls, and other operations with potential failure conditions, that lack appropriate error handling. This includes missing error callbacks, unhandled asynchronous failures, and missing exception handling where necessary.

Exclusions: The system MUST NOT report unrelated code-quality issues, including formatting, unused variables, naming conventions, performance anti-patterns, and deprecated APIs, unless the issue independently qualifies under one of the two specified review categories.

- **FR-009**: Ground-Truth Matching: During automated evaluation, a generated finding MUST match a ground-truth expected finding only when its category matches and its reported line number is within ±2 lines of the expected line number. Each expected finding MUST be matched at most once to prevent duplicate findings from increasing evaluation scores.

- **FR-010**: Evaluation Metrics: The evaluation framework MUST calculate Precision, Recall, and F1 Score separately for each review category.

The metrics MUST use the following formulas:

Precision = TP / (TP + FP)

Recall = TP / (TP + FN)

F1 Score = 2 × (Precision × Recall) / (Precision + Recall)

The overall evaluation score MUST use macro-averaged F1, calculated as the arithmetic mean of the F1 scores of the two review categories:

Macro F1 = (F1 for hardcoded-text + F1 for missing-error-handling) / 2.

When no findings are predicted for a category, its precision MUST be treated as zero to ensure a consistent numerical evaluation result.

- **FR-011**: Evaluation Threshold: The minimum acceptable evaluation threshold is macro-averaged F1 ≥ 0.70, set by the project author. The threshold MUST be fixed before final evaluation commences and MUST NOT be lowered or modified based on final evaluation results. Individual category-level precision, recall, and F1 scores MUST also be reported.

- **FR-012**: Evaluation Layers: The evaluation suite MUST cover three distinct evaluation layers:

Structural validation: Verifies JSON output schema compliance, required fields, expected data types, and allowed run status values.

Property/invariant validation: Verifies verbatim evidence extraction, valid line number boundaries, and allowed category and severity values.

Semantic/quality evaluation: Verifies ground-truth matching and calculates precision, recall, and F1 scores to assess the accuracy and usefulness of findings.

- **FR-013**: Synthetic Dataset: The evaluation dataset MUST contain exactly 18 synthetic test cases with known expected findings. The dataset MUST include the following distribution:

4 positive cases containing hardcoded user-visible text.

4 positive cases containing missing error handling.

4 negative cases containing neither review category.

3 boundary cases covering ambiguous or borderline examples.

3 mixed-category cases containing both types of issues.

All evaluation inputs MUST be synthetic and MUST have predefined ground-truth annotations.

- **FR-014**: Failure Classification: The system MUST distinguish the following failure classes from actual code-review findings:

Service/model failures: Connection failures, timeouts, rate limits, and network errors. These MUST use the "service_error" run status.

Invalid model responses: Malformed JSON, missing required fields, or responses that violate the defined output schema. These MUST use the "invalid_model_response" run status.

Evaluation failures: Failures occurring during evaluation or validation of generated results. These MUST use the "evaluation_error" run status.

Successful execution: A completed review MUST use the "success" run status.

These failures MUST NOT be reported as code-review findings.

### Key Entities *(include if feature involves data)*

Review Finding: Represents a single detected issue in the UI5 file, characterized by category, line number, severity, verbatim evidence, rationale, and suggestion.

Review Report: Represents the collection of review findings, metadata, and run status returned in the fixed JSON schema.

Evaluation Dataset: A collection of exactly 18 synthetic test cases with ground-truth annotations used to measure review accuracy.

Evaluation Result: Represents the precision, recall, category-level F1 scores, and overall macro-averaged F1 score calculated during evaluation.


## Success Criteria *(mandatory)*

Success Criteria (mandatory)

Measurable Outcomes

SC-001: 100% of the 18 synthetic input files are accepted without a usage error.

SC-002: 100% of successful review responses conform to the defined JSON output schema, including all required finding fields and valid data types.

SC-003: 100% of reported evidence snippets match the original input text verbatim.

SC-004: 100% of reported line numbers refer to valid locations in the original input file.

SC-005: The system reports findings only for the two specified categories and does not introduce unrelated code-quality findings.

SC-006: The evaluation framework calculates precision, recall, and F1 separately for both categories and produces the overall macro-averaged F1 score.

SC-007: The system achieves an overall macro-averaged F1 score of at least 0.70 on the predefined evaluation dataset.

SC-008: All 18 synthetic evaluation cases are executed and assessed against their predefined ground-truth annotations.

SC-009: Service/model failures, invalid model responses, and evaluation failures are distinguishable through their respective run statuses and are not counted as review findings.

SC-010: Structural, property/invariant, and ground-truth evaluation of stored synthetic test results can be completed without external network access.

## Project Decision Log

Precision when no findings are predicted: Precision is treated as zero when there are no predicted findings for a category. This avoids undefined numerical results and ensures that a category with no detected findings does not receive an artificially favourable score.

Evaluation threshold: The minimum macro-averaged F1 threshold of 0.70 was selected and fixed by the project author before the evaluation dataset was built. It will not be adjusted based on evaluation results.

Dataset distribution: The 18 synthetic cases are divided into 4 hardcoded-text positive cases, 4 missing-error-handling positive cases, 4 negative cases, 3 boundary cases, and 3 mixed-category cases.

Hermetic evaluation: Stored synthetic test results can be evaluated without network access. Live Gemini-based reviews still require model connectivity.

## Assumptions

- Users have proper file system read access to the target UI5 controller or XML view files.
- Model credentials or environment configuration are correctly supplied via secure environment variables.
- Target UI5 files are standard JavaScript ES modules or valid XML views.
- Synthetic evaluation dataset test cases are maintained locally within the test suite environment.
