# Feature Specification: UI5 Manifest Validator

**Feature Branch**: `001-ui5-manifest-validator`

**Created**: 2026-11-08

**Status**: Draft

**Input**: User description: "Command-line tool ui5-manifest-validator that checks one or more SAP UI5 manifest.json files against six rules and reports results. Describe WHAT and WHY only; do not choose technology (that belongs in the plan). Rules (each has an ID and a binary PASS/FAIL criterion): R-001 sap.app.id: PASS if present, a string, and made of at least two dot-separated segments, each starting with a letter followed by letters or digits (e.g. my.app.demo). Otherwise FAIL. R-002 sap.app.type: PASS if present and exactly one of "application", "component", "library". Otherwise FAIL. R-003 sap.ui5.rootView: PASS if present as a non-empty string, or as an object whose viewName is a non-empty string. Otherwise FAIL. R-004 sap.ui5.models dataSources: for every model entry that has a dataSource property, PASS only if that value is a key in sap.app.dataSources. Models without a dataSource property are not checked. If sap.ui5.models is absent or empty, PASS. FAIL lists each offending model name. R-005 minUI5Version: PASS if sap.ui5.dependencies.minUI5Version is present and a string matching major.minor or major.minor.patch with numeric parts (e.g. 1.120 or 1.120.1). Otherwise FAIL. R-006 sap.app.i18n: PASS if present as a non-empty string, or as an object whose bundleUrl is a non-empty string. Otherwise FAIL. Input: one or more file paths as arguments. Files are processed in the order given. Output (plain text, default): for each file, a header line with the path, then one line per rule in ID order, either "PASS R-00X" or "FAIL R-00X: <message>". Output must be identical for identical inputs. Optional --json flag: output a single JSON object instead, with a files array (path, status, results with id, status, message) and a summary (files checked, passed, failed). Exit codes: 0 = every file passed all rules; 1 = at least one rule violation and no usage errors; 2 = usage error (no file arguments, unknown flag, file not found or unreadable, or file is not valid JSON). If both kinds occur across several files, exit 2 takes precedence over 1, and every file is still reported. Constraints: no network access; no modification of input files; no auto-fix; no full JSON-schema validation of the manifest. Edge cases to cover in acceptance scenarios: empty file, invalid JSON, manifest missing the sap.app or sap.ui5 sections entirely, rule keys with wrong types (e.g. id is a number), duplicate file paths, many files at once, and a model referencing a missing dataSource."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Validate Manifest Files and Report Results in Plain Text (Priority: P1)

As a developer or build engineer, I want to run the command-line tool with one or more SAP UI5 `manifest.json` file paths so that I can verify their compliance against standard rules (R-001 through R-006) and see clear plain-text reports for each file.

**Why this priority**: P1 delivers the core functionality of validating manifests and reporting rule outcomes in the default plain-text format, enabling automated and manual checks.

**Independent Test**: Can be fully tested by running the validator with sample valid and invalid manifest files and verifying that each rule output (`PASS R-00X` or `FAIL R-00X: <message>`) matches expected criteria.

**Acceptance Scenarios**:

1. **Given** a valid manifest file conforming to all rules, **When** the tool is executed with the file path, **Then** it outputs the file path header and `PASS` for rules R-001 through R-006, exiting with code 0.
2. **Given** a manifest file violating rule R-001 (e.g., ID has only one segment or invalid character), **When** the tool is executed, **Then** it outputs `FAIL R-001: <message>` along with results for other rules, exiting with code 1.
3. **Given** multiple files provided as arguments, **When** processed in order, **Then** each file is reported in the exact order given.
4. **Given** duplicate file paths passed as arguments, **When** executed, **Then** each occurrence of the file path is processed and reported separately.

---

### User Story 2 - JSON Output Format (Priority: P2)

As a CI/CD pipeline operator, I want an optional `--json` flag so that I can programmatically parse validation results and summaries.

**Why this priority**: P2 enables integration with automated testing pipelines and reporting dashboards.

**Independent Test**: Can be fully tested by running the tool with `--json` and asserting the output structure contains a `files` array and a `summary` object with correct counts.

**Acceptance Scenarios**:

1. **Given** one or more manifest files and the `--json` flag, **When** executed, **Then** the output is a single valid JSON object containing `files` (with path, status, and results array containing id, status, and message) and `summary` (`files checked`, `passed`, `failed`).

---

### User Story 3 - Robust Usage Error Handling and Exit Codes (Priority: P3)

As a user, I want clear exit codes (0, 1, 2) and descriptive usage/error messages when usage errors or unreadable/invalid JSON files occur, so that I can diagnose issues correctly.

**Why this priority**: P3 ensures robust error handling, correct precedence between usage errors and rule violations, and proper handling of edge cases.

**Independent Test**: Can be fully tested by providing empty files, invalid JSON, missing files, or no arguments, verifying exit code 2 and appropriate error reporting.

**Acceptance Scenarios**:

1. **Given** no file arguments or an unknown flag, **When** executed, **Then** it reports a usage error and exits with code 2.
2. **Given** a file that is missing, unreadable, empty, or contains invalid JSON, **When** executed, **Then** it reports a usage error (exit code 2).
3. **Given** a mix of files where some have usage errors and others have rule violations, **When** executed, **Then** exit code 2 takes precedence over 1, and every file is still reported.

---

### Edge Cases

- Empty file (zero bytes): treated as usage error (exit code 2).
- Invalid JSON syntax: treated as usage error (exit code 2).
- Manifest missing `sap.app` or `sap.ui5` sections entirely: rules evaluating those sections fail gracefully without crashing.
- Rule keys with wrong types (e.g., `id` is a number instead of a string): rules fail with appropriate messages.
- Duplicate file paths in arguments: each argument instance is processed and reported.
- Many files processed at once: handles large batch arguments correctly and efficiently.
- A model referencing a missing `dataSource`: R-004 fails and lists the offending model name.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept one or more file paths as command-line arguments and process them in the exact order given.
- **FR-002**: System MUST validate each manifest against Rule R-001 (`sap.app.id` present, string, at least two dot-separated segments starting with letter followed by letters/digits).
- **FR-003**: System MUST validate each manifest against Rule R-002 (`sap.app.type` present and exactly one of `"application"`, `"component"`, `"library"`).
- **FR-004**: System MUST validate each manifest against Rule R-003 (`sap.ui5.rootView` present as non-empty string or object with non-empty `viewName`).
- **FR-005**: System MUST validate each manifest against Rule R-004 (`sap.ui5.models dataSources`: models with `dataSource` property must reference a key in `sap.app.dataSources`; unreferenced/absent `dataSource` models pass; absent/empty `sap.ui5.models` passes; failure lists offending model name).
- **FR-006**: System MUST validate each manifest against Rule R-005 (`minUI5Version`: present under `sap.ui5.dependencies.minUI5Version` as string matching `major.minor` or `major.minor.patch` with numeric parts).
- **FR-007**: System MUST validate each manifest against Rule R-006 (`sap.app.i18n` present as non-empty string or object with non-empty `bundleUrl`).
- **FR-008**: System MUST output in plain text by default, displaying a header line with the file path followed by one line per rule in ID order (`PASS R-00X` or `FAIL R-00X: <message>`), producing identical output for identical inputs.
- **FR-009**: System MUST support an optional `--json` flag to output a single JSON object with `files` array and `summary` object.
- **FR-010**: System MUST enforce exit codes: `0` for all files passing all rules; `1` for rule violations without usage errors; `2` for usage errors (no file arguments, unknown flag, file not found/unreadable, invalid JSON), where exit 2 takes precedence over 1 when both occur.
- **FR-011**: System MUST operate under constraints: no network access, no modification of input files, no auto-fix, and no full JSON-schema validation.

### Key Entities

- **Manifest File**: A JSON document representing an SAP UI5 application, component, or library configuration containing optional sections (`sap.app`, `sap.ui5`, `dataSources`, etc.).
- **Validation Rule**: A discrete compliance check (R-001 through R-006) with a binary PASS/FAIL criterion and deterministic message.
- **Validation Result**: The outcome of applying a rule to a manifest file, consisting of Rule ID, status (`PASS`/`FAIL`), and optional failure message.
- **Summary Report**: Aggregate statistics of files checked, passed, and failed across the batch execution.

## Success Criteria *(measurable outcomes)*

- **SC-001**: 100% deterministic plain-text and JSON outputs for identical inputs and file orders.
- **SC-002**: Correct application of exit codes (0, 1, 2) in 100% of test cases, including precedence handling.
- **SC-003**: 100% accuracy in detecting rule violations across R-001 through R-006, including missing sections and wrong data types.
- **SC-004**: Processing batch inputs of 50+ files completes in under 2 seconds.

## Assumptions

- Input files are standard UTF-8 encoded JSON files.
- Command-line argument parsing follows standard conventions (e.g. flags before or intermixed with file paths).
- Filesystem permissions govern readability of input files.
