---
description: "Task list for UI5 Manifest Validator implementation"
---

# Tasks: UI5 Manifest Validator

**Input**: Design documents from `/specs/001-ui5-manifest-validator/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/cli-contract.md, quickstart.md

**Organization**: Tasks are grouped by setup, TDD failing tests, implementation, and evidence/harness verification.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story mapping (US1, US2, US3) or setup/polish phase

---

## Phase 1: Setup (Infrastructure & Directories)

**Purpose**: Initialize `.harness/`, `tests/`, `src/`, fixtures, package.json, and ESLint configuration.

- [X] T001 Create project directories (`src/`, `tests/fixtures/`, `.harness/`, `evidence/initial-generation/`)
- [X] T002 [P] Create `.harness/package.json` with Node.js test runner setup and dev dependencies (`eslint`, `eslint-plugin-security`)
- [X] T003 [P] Create `.harness/eslint.config.js` with ESLint flat configuration and `eslint-plugin-security` rules enabled with zero suppressions
- [X] T004 [P] Create baseline valid and invalid manifest fixtures in `tests/fixtures/` for R-001 through R-006 testing
- [X] T004a Create root `package.json` with `"type": "module"` and scripts `test`, `lint`, `harness`
- [X] T004b [P] Create `.harness/secret-scan.js` (scans repo files for key and token patterns, exits non-zero on findings)
- [X] T004c Create `.harness/run-harness.js` that runs lint, security, secret scan and tests, and saves results to `evidence/harness-results/`

---

## Phase 2: Foundational & TDD Failing Tests (Writing Tests FIRST)

**Purpose**: Write comprehensive failing tests for rules R-001 to R-006, all functional requirements (FR-001 to FR-011), exit codes, JSON output, determinism, duplicate paths, and performance, ensuring the first test run fails.

- [X] T005 [P] [US1] Write failing unit test for Rule R-001 (`sap.app.id` validation) in `tests/validator.test.js`
- [X] T006 [P] [US1] Write failing unit test for Rule R-002 (`sap.app.type` validation) in `tests/validator.test.js`
- [X] T007 [P] [US1] Write failing unit test for Rule R-003 (`sap.ui5.rootView` validation) in `tests/validator.test.js`
- [X] T008 [P] [US1] Write failing unit test for Rule R-004 (`sap.ui5.models dataSources` validation) in `tests/validator.test.js`
- [X] T009 [P] [US1] Write failing unit test for Rule R-005 (`minUI5Version` version string validation) in `tests/validator.test.js`
- [X] T010 [P] [US1] Write failing unit test for Rule R-006 (`sap.app.i18n` validation) in `tests/validator.test.js`
- [X] T011 [P] [US1] Write failing tests for FR-001 through FR-008 (batch file processing, plain-text output format and determinism) in `tests/validator.test.js`
- [X] T012 [P] [US2] Write failing test for `--json` output format (FR-009) in `tests/validator.test.js`
- [X] T013 [P] [US3] Write failing tests for exit-code behaviors (0, 1, 2, precedence) and usage errors (FR-010, FR-011, empty files, invalid JSON, missing files) in `tests/validator.test.js`
- [X] T013a [P] [US1] Write failing tests for FR-012 (R-004 fails when `sap.app.dataSources` is missing) and FR-013 (wrong-type values fail R-001, R-002, R-003, R-005, R-006) in `tests/validator.test.js`
- [X] T013b [P] [US3] Write failing hermetic tests: no network calls and input files unchanged after validation (FR-011)
- [X] T014 [P] [US1] Write failing test for duplicate-path handling in `tests/validator.test.js`
- [X] T015 [P] [US1] Write failing test for 50-file performance check (completing under 2 seconds) in `tests/validator.test.js`
- [X] T016 Run initial test suite to verify that all written tests fail as required
- [X] T016a HUMAN: review `tests/` and `.harness/` against the spec, save the failing test run to `evidence/`, then freeze both folders. The agent may not edit them from here on (constitution IV)

---

## Phase 3: Implementation

**Purpose**: Implement core validation rules, orchestrator validator, and CLI interface.

- [ ] T017 Implement pure rule functions for R-001 through R-006 in `src/rules.js`
- [ ] T018 Implement core validation orchestrator (file reading, JSON parsing, batch processing) in `src/validator.js`
- [ ] T019 Implement CLI entry point, argument parsing, plain-text formatting, `--json` flag handling, and strict exit codes (0, 1, 2) in `src/cli.js`

---

## Phase 4: Verification, Harness & Evidence Preservation

**Purpose**: Run test suite, verify implementation passes all tests, save initial generation, run harness, write evidence log, and record final ACCEPT/REJECT decision.

- [ ] T020 HUMAN: immediately after T019, copy the first generated implementation to `evidence/initial-generation/` before any fix
- [ ] T021 Run `npm run harness` and save results to `evidence/harness-results/`
- [ ] T022 If a gate fails, give the failure evidence to the agent, repair `src/` only, and rerun the same harness
- [ ] T023 HUMAN: write `evidence/harness-log.md` entries and the final ACCEPT or REJECT decision in your own words
- [ ] T024 Write `README.md` with instructions to run the harness

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational & TDD Tests (Phase 2)**: Depends on Setup completion - writes failing tests before implementation
- **Implementation (Phase 3)**: Depends on failing tests in Phase 2
- **Verification, Harness & Evidence (Phase 4)**: Depends on successful implementation and test passing

### Parallel Opportunities
- T002, T003, T004 can run in parallel during Setup
- T005 through T015 (all failing test writing tasks) can run in parallel
- T021 and T022 can run in parallel during final verification

---

## Implementation Strategy

### TDD & Incremental Delivery
1. Setup project structure and testing harness.
2. Write all failing tests for R-001..R-006, FR-IDs, exit codes, JSON output, determinism, duplicate paths, and 50-file performance. Verify first test run fails.
3. Implement `src/rules.js`, `src/validator.js`, and `src/cli.js`.
4. Run test suite and ensure all tests pass.
5. Preserve initial generation in `evidence/initial-generation/`, run harness to generate `evidence/harness-log.md`, and record final decision.
