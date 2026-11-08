# Research: UI5 Manifest Validator

**Branch**: `001-ui5-manifest-validator` | **Date**: 2026-11-08

## 1. Rule Validation Logic & Pure Functions

### R-001 (`sap.app.id`)
- **Decision**: Implement as a pure function `validateSapAppId(manifest)` returning `{ status: 'PASS' | 'FAIL', message?: string }`.
- **Rationale**: Checks `manifest?.['sap.app']?.id`.
  - PASS if present, is a string, and matches regex `/^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)+$/` (at least two dot-separated segments, each starting with a letter followed by letters or digits).
  - Otherwise FAIL with a clear descriptive message.

### R-002 (`sap.app.type`)
- **Decision**: Implement as a pure function `validateSapAppType(manifest)`.
- **Rationale**: Checks `manifest?.['sap.app']?.type`.
  - PASS if present and is exactly one of `"application"`, `"component"`, `"library"`.
  - Otherwise FAIL.

### R-003 (`sap.ui5.rootView`)
- **Decision**: Implement as a pure function `validateSapUi5RootView(manifest)`.
- **Rationale**: Checks `manifest?.['sap.ui5']?.rootView`.
  - PASS if present as a non-empty string (`typeof val === 'string' && val.trim().length > 0`), or as an object where `val.viewName` is a non-empty string (`typeof val === 'object' && val !== null && typeof val.viewName === 'string' && val.viewName.trim().length > 0`).
  - Otherwise FAIL.

### R-004 (`sap.ui5.models dataSources`)
- **Decision**: Implement as a pure function `validateSapUi5ModelsDataSources(manifest)`.
- **Rationale**:
  - If `manifest?.['sap.ui5']?.models` is absent or empty (e.g. undefined, null, or empty object/array), PASS.
  - Otherwise, inspect each model entry. If a model entry has a `dataSource` property (string), verify that key exists in `manifest?.['sap.app']?.dataSources` (object).
  - Models without a `dataSource` property are skipped.
  - FAIL if any model references a missing dataSource, listing the offending model name(s) in the failure message.

### R-005 (`minUI5Version`)
- **Decision**: Implement as a pure function `validateMinUi5Version(manifest)`.
- **Rationale**: Checks `manifest?.['sap.ui5']?.dependencies?.minUI5Version`.
  - PASS if present and is a string matching regex `/^\d+\.\d+(\.\d+)?$/` (major.minor or major.minor.patch with numeric parts).
  - Otherwise FAIL.

### R-006 (`sap.app.i18n`)
- **Decision**: Implement as a pure function `validateSapAppI18n(manifest)`.
- **Rationale**: Checks `manifest?.['sap.app']?.i18n`.
  - PASS if present as a non-empty string, or as an object where `bundleUrl` is a non-empty string.
  - Otherwise FAIL.

---

## 2. CLI Argument Parsing & Error Handling

- **Decision**: Manual argument parsing without external libraries (`process.argv.slice(2)`).
- **Rationale**:
  - Distinguish flags (e.g., `--json`) from file paths.
  - Check for usage errors:
    - No file arguments provided → Exit code 2.
    - Unknown flags (any argument starting with `-` other than `--json`) → Exit code 2.
    - File not found, unreadable, zero-byte (empty), or invalid JSON syntax → Exit code 2.
  - Exit code precedence: Usage error (2) takes precedence over rule violations (1). If any usage error occurs in the batch, the entire command exits with code 2, while still attempting to report or note file validation states as specified.

---

## 3. Output Formatting & Determinism

- **Plain Text (Default)**:
  - For each file: Header line with path (`<path>`), followed by 6 lines in exact ID order (`PASS R-00X` or `FAIL R-00X: <message>`).
- **JSON (`--json`)**:
  - Single JSON object containing `files` (array of `{ path, status, results: [{ id, status, message }] }`) and `summary` (`{ filesChecked, passed, failed }`).
- **Determinism**:
  - Object keys and iteration order are strictly preserved; output generation uses pure formatting routines.

---

## 4. Testing Strategy

- **Test Framework**: Node.js built-in test runner (`node:test`, `node:assert`).
- **Fixtures**: Stored under `tests/fixtures/` (e.g., `valid-manifest.json`, `invalid-r001.json`, `invalid-json.json`, etc.).
- **Unit Tests**: Test each pure rule function in `rules.js` directly with various valid and invalid inputs.
- **Integration Tests**: Test CLI execution, plain text output, `--json` output, batch file ordering, and exit code semantics (0, 1, 2).
