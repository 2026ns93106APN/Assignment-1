---
description: "Task list for UI5 Code Review Assistant implementation and evaluation"
---

# Tasks: UI5 Code Review Assistant

**Input**: Design documents from `/specs/001-ui5-review-assistant/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: TDD approach with failing structural and property tests written before implementation.

**Organization**: Tasks are grouped by setup, test suite, human freeze gate, implementation, and evaluation harness.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup & Infrastructure

**Purpose**: Create directory structure, configuration files, and utility scripts

- [ ] T001 Create required directories: `src/`, `prompts/`, `evals/`, `tests/unit/`, `tests/property/`, `tests/structural/`, `.harness/`, `evidence/`
- [ ] T002 [P] Create root `package.json` with `"type": "module"` and dependencies (`@google/genai`, `dotenv`, `eslint`, `eslint-plugin-security`)
- [ ] T003 [P] Create `.harness/eslint.config.js` with flat config and security plugin rules enforcing zero tolerance
- [ ] T004 [P] Create a secret-scan script in repository root to scan files for leaked credentials

---

## Phase 2: Prompts

**Purpose**: Define system instructions for the Gemini model

- [ ] T005 Write `prompts/system-prompt.txt` content, explicitly including instructions for reviewing hardcoded user-visible text (i18n) and missing error handling, and specifying the convention that a missing-error-handling finding reports the line where the risky call begins
- [ ] T005a [HUMAN] Verify that `prompts/system-prompt.txt` uses the same line-number convention as the ground-truth annotations in `evals/dataset.json`.

---

## Phase 3: Test Suite Implementation (Failing Tests)

**Purpose**: Write failing structural and property tests against stored fixtures

- [ ] T006 [P] [US2] Write failing structural tests against `contracts/output-schema.json` in `tests/structural/schema.test.js` using stored fixture JSON (not live calls)
- [ ] T007 [P] [US1] Write failing property tests for verbatim-evidence and valid-line-number rules (FR-007) in `tests/property/verbatim.test.js` against stored fixtures
- [ ] T008 [P] [US1] Write failing property tests for category exclusions (FR-008) in `tests/property/exclusions.test.js` against stored fixtures
- [ ] T009 [P] [US1] Write failing property tests for ground-truth matching with ±2 line tolerance and single-match rule (FR-009) in `tests/property/matching.test.js` against stored fixtures
- [ ] T010 Run the initial test suite using `node --test` and verify that the tests fail as expected before implementation.

---

## Phase 4: Human Review & Freeze (Specification Lock)

**Purpose**: Human review and immutability lock before implementation begins

- [ ] T011 [HUMAN] Review `tests/`, `.harness/`, `evals/dataset.json`, and `prompts/` against the spec, then freeze them (tag the commit) before implementation begins; the agent must not edit these afterwards

---

## Phase 5: Core Implementation (User Stories 1 & 2)

**Purpose**: Implement schema validator, reviewer logic, and CLI tool

- [ ] T012 [P] [US2] Implement `src/schema-validator.js` to validate review reports against `contracts/output-schema.json`
- [ ] T013 [US1] Implement `src/reviewer.js` to interact with the Gemini API using `@google/genai`, load `prompts/system-prompt.txt`, request structured JSON output, and parse the response while handling malformed or invalid model responses.
- [ ] T014 [US1] Implement `src/cli.js` for command-line argument parsing, loading `.env` via `dotenv`, executing file review on a single UI5 controller or XML view file, and handling `service_error`, `invalid_model_response`, and `success` statuses without exposing secrets.

---

## Phase 6: Initial Generation Archive

**Purpose**: Archive initial generated code state

- [ ] T015 [HUMAN] Copy the first generated `src/` into `evidence/initial-generation/` before any evaluation run

---

## Phase 7: Evaluation Runner & Execution

**Purpose**: Implement evaluation runner and run harness against 18 synthetic cases

- [ ] T016 [US1] Write `evals/eval-runner.js` to run the live Gemini model once per case in `evals/dataset.json`, independently validate outputs structurally and through property tests, calculate per-category precision, recall, F1 and overall macro-F1 against ground truth, and write evaluation results and metrics to `evidence/`. Catch and classify service/model failures as `service_error`, invalid model responses as `invalid_model_response`, and evaluation failures as `evaluation_error`, without crashing or counting failures as review findings.

---

## Phase 8: Harness Review & Final Log

**Purpose**: Review evaluation results and record outcomes

- [ ] T017 [HUMAN] Run the harness/evaluation, review results, and record ACCEPT or REJECT with limitations in `evidence/harness-log.md`

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: No dependencies - can start immediately
- **Prompts (Phase 2)**: Depends on Phase 1 directories
- **Test Suite (Phase 3)**: Depends on Phase 1 & 2
- **Human Freeze (Phase 4)**: Depends on Phase 3 completion
- **Implementation (Phase 5)**: Depends on Phase 4 completion (frozen test suite)
- **Initial Generation Archive (Phase 6)**: Depends on Phase 5 completion
- **Evaluation Runner (Phase 7)**: Depends on Phase 6 completion
- **Harness Review (Phase 8)**: Depends on Phase 7 completion

### Parallel Opportunities
- T002, T003, T004 can run in parallel in Phase 1.
- T006, T007, T008, T009 can run in parallel in Phase 3.
- T012 can run independently.
