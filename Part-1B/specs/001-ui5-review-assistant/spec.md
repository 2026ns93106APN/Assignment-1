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
- **FR-006**: **JSON Output Schema**: The output JSON schema MUST include a top-level run status (`status` string with allowed values `"success"`, `"error"`, or `"model_error"`), metadata, and a findings array. Each finding object in the array MUST contain:
  - `category`: string (allowed values: `"hardcoded-text"` or `"missing-error-handling"`).
  - `line`: integer (representing the 1-based line number in the original input file).
  - `severity`: string (allowed values: `"low"`, `"medium"`, `"high"`).
  - `evidence`: string (verbatim snippet from the input file).
  - `rationale`: string (explanation of why the finding was flagged).
  - `suggestion`: string (actionable recommendation to resolve the issue).
- **FR-007**: **Evidence & Line Number Validation**: The reported `evidence` string MUST be copied verbatim from the input file, and the reported `line` number MUST accurately refer to the line number in the original input file.
- **FR-008**: **Category Definitions & Scope Boundaries**:
  - *Hardcoded user-visible text requiring i18n*: User-facing text strings displayed in UI components (such as control properties, labels, button texts, titles, dialog messages, table headers, and tooltips) that are hardcoded literals rather than referencing an i18n resource model or bundle.
  - *Missing error handling*: Asynchronous operations (such as Promises, fetch requests, OData/API calls) lacking `.catch()` or error callbacks, or risky operations lacking appropriate `try/catch` error management blocks.
  - *Exclusion*: The system MUST exclude unrelated code-quality findings (such as code formatting, unused variables, naming conventions, performance anti-patterns, or deprecations) that do not belong to the two specified review categories.
- **FR-009**: **Ground-Truth Matching**: In automated evaluation, a generated finding matches a ground-truth expected finding if and only if their categories match and the reported line number is within ±2 lines of the expected line number.
- **FR-010**: **Evaluation Metrics**: The evaluation framework MUST calculate Precision ($TP / (TP + FP)$), Recall ($TP / (TP + FN)$), and F1 Score ($2 \times \text{Precision} \times \text{Recall} / (\text{Precision} + \text{Recall})$) calculated separately for each review category and as overall macro/micro aggregate results.
- **FR-011**: **Evaluation Threshold**: The minimum acceptable evaluation threshold is F1 ≥ 0.70. This threshold MUST be fixed before final evaluation commences and MUST NOT be lowered or modified based on final evaluation results.
- **FR-012**: **Evaluation Layers**: The evaluation suite MUST cover three distinct evaluation layers:
  - *Structural validation*: Verifies JSON output schema compliance, expected data types, and run status codes.
  - *Property/invariant validation*: Verifies verbatim evidence extraction, line number bounds, and allowed category/severity value whitelists.
  - *Semantic/quality evaluation*: Verifies ground-truth matching and calculates precision, recall, and F1 score.
- **FR-013**: **Synthetic Dataset**: The evaluation dataset MUST contain exactly 18 synthetic test cases with known expected findings. The dataset MUST include positive, negative, boundary, and mixed-category examples covering both review categories. All evaluation test inputs MUST be synthetic only.
- **FR-014**: **Failure Classification**: The system MUST keep Gemini/model/service failures (such as timeouts, rate limits, network errors), invalid model responses (such as malformed JSON or schema violations), and evaluation failures strictly distinguishable from actual code-review findings in both execution outputs and evaluation reports.

### Key Entities *(include if feature involves data)*

- **Review Finding**: Represents a single detected issue in the UI5 file, characterized by category, line number, severity, verbatim evidence, rationale, and suggestion.
- **Review Report**: Represents the collection of review findings and run status returned in the fixed JSON schema.
- **Evaluation Dataset**: A collection of exactly 18 synthetic test cases with ground-truth annotations used to measure review accuracy.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of review outputs strictly conform to the fixed JSON schema.
- **SC-002**: 100% of findings include verbatim evidence, line number, category, severity, rationale, and suggestion matching expected data types and allowed value enums.
- **SC-003**: Review execution for a standard UI5 file completes in under 10 seconds.
- **SC-004**: Zero false categorization outside the two specified categories (hardcoded text and missing error handling).
- **SC-005**: 100% of reported finding evidence strings are exact verbatim substrings of the input file, and reported line numbers are within the valid file line range.
- **SC-006**: 100% of unrelated code-quality findings (formatting, naming, unused variables) are successfully excluded from review reports.
- **SC-007**: Ground-truth matching correctly identifies matches where category matches and line numbers are within ±2 lines.
- **SC-008**: Precision, recall, and F1 scores are calculated accurately for both individual categories and overall aggregate results.
- **SC-009**: The evaluation F1 score achieves at least the fixed threshold of F1 ≥ 0.70 across the evaluation run.
- **SC-010**: All three evaluation layers (structural, property/invariant, semantic/quality) execute successfully during quality validation.
- **SC-011**: The evaluation dataset consists of exactly 18 synthetic test cases covering positive, negative, boundary, and mixed scenarios.
- **SC-012**: Service failures, invalid model responses, and evaluation errors are distinctly classified and reported without being conflated with code review findings.

## Assumptions

- Users have proper file system read access to the target UI5 controller or XML view files.
- Model credentials or environment configuration are correctly supplied via secure environment variables.
- Target UI5 files are standard JavaScript ES modules or valid XML views.
- Synthetic evaluation dataset test cases are maintained locally within the test suite environment.
