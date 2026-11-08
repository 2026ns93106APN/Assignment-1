# Implementation Plan: UI5 Manifest Validator

**Branch**: `001-ui5-manifest-validator` | **Date**: 2026-11-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-ui5-manifest-validator/spec.md`

## Summary

Build a robust, offline-capable command-line tool (`ui5-manifest-validator`) in Node.js (ES modules) with zero runtime dependencies beyond the Node standard library. The tool validates one or more SAP UI5 `manifest.json` files against six discrete rules (R-001 through R-006), supporting plain-text output by default and JSON output via `--json`. It enforces strict exit codes (0 for success, 1 for rule violations, 2 for usage errors) and maintains zero-tolerance code quality and security standards via ESLint and `eslint-plugin-security`.

## Technical Context

**Language/Version**: Node.js (JavaScript, ES modules, Node 18+)

**Primary Dependencies**: Node standard library only (`node:fs`, `node:path`, `node:process`) for core logic; dev dependencies for quality/security (`eslint`, `eslint-plugin-security`).

**Storage**: Local file system (reads JSON files).

**Testing**: Node built-in test runner (`node:test` and `node:assert`).

**Target Platform**: Node.js runtime on Linux (offline-capable).

**Project Type**: CLI tool and modular JavaScript library.

**Performance Goals**: Batch processing of 50+ files in under 2 seconds.

**Constraints**: Zero runtime dependencies, offline-capable, strict exit code semantics (0, 1, 2), no suppression or disabling of lint/security rules.

**Scale/Scope**: 6 validation rules (R-001 to R-006), plain-text & JSON output formats, comprehensive error handling.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Deterministic Hermetic Execution & CLI Contract**: PASS. Fully hermetic, offline, deterministic outputs, strict exit codes (0, 1, 2).
- **II. Specification-Driven Traceability & Verification**: PASS. Every requirement mapped to test cases with binary PASS/FAIL criteria.
- **III. Zero-Tolerance Code Quality & Security Standards**: PASS. ESLint flat config with `eslint-plugin-security`, zero errors, zero warnings, zero findings, no rule suppressions.
- **IV. Inviolable Test Harness & Agent Boundaries**: PASS. Respects protected paths (`tests/`, `.harness/`, `evidence/initial-generation/`).
- **V. Evidence Preservation & Baseline Provenance**: PASS. Initial generation captured and preserved in `evidence/initial-generation`.

## Project Structure

### Documentation (this feature)
```text
specs/001-ui5-manifest-validator/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── cli-contract.md  # CLI interface & exit codes contract
└── tasks.md             # Phase 2 output (created by speckit.tasks)
```

### Source Code (repository root)
```text
src/
├── cli.js               # CLI entry point, argument parsing, formatting, exit codes
├── validator.js         # Core validation orchestrator (file reading, batch processing)
└── rules.js             # Pure functions for rules R-001 through R-006

tests/
├── validator.test.js    # Unit and integration tests using node:test
└── fixtures/            # Test fixtures (valid and invalid manifests)

.harness/
├── eslint.config.js     # ESLint flat configuration with eslint-plugin-security
└── package.json         # Project manifest and development dependencies
```

**Structure Decision**: Single project modular structure (`src/`, `tests/`, `.harness/`) keeping CLI separation, pure rule functions, and test fixtures cleanly organized.
