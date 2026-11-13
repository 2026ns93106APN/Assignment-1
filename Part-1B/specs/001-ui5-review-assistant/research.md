# Research: UI5 Code Review Assistant

**Branch**: `001-ui5-review-assistant` | **Date**: 2026-11-13

## Overview
This document consolidates research and technical decisions for implementing the UI5 Code Review Assistant tool, covering Gemini API integration, dotenv configuration, ESLint flat config security setup, Node.js built-in test runner usage, evaluation metrics (precision, recall, macro-F1), and failure classification handling.

---

## 1. Gemini API Integration & ES Modules (`src/`)
- **Decision**: Use `@google/genai` (Google Gen AI SDK) imported via ES modules in `src/reviewer.js`.
- **Rationale**: The official Google Gen AI SDK provides robust programmatic access to Gemini models with native support for ES modules and structured generation/parsing.
- **Alternatives Considered**: Direct REST fetch calls; rejected because SDK provides cleaner client initialization, error typing, and version stability.

## 2. Environment Variable & Secret Management (`.env`)
- **Decision**: Load environment variables using `dotenv` at the entry point (`src/cli.js`), ensuring `GEMINI_API_KEY` is retrieved from `.env` and never logged, printed, or checked into version control.
- **Rationale**: Complies strictly with Constitution IV (Secret Management) and security mandates.
- **Alternatives Considered**: Passing API key via CLI flags; rejected because command-line arguments can be exposed in process lists (`ps`).

## 3. ESLint Flat Config & Security (`.harness/`)
- **Decision**: Establish ESLint flat config in `.harness/eslint.config.js` incorporating `eslint-plugin-security` with zero tolerance for errors or warnings.
- **Rationale**: Enforces strict security best practices (Constitution III) and keeps harness configuration cleanly separated from source code.
- **Alternatives Considered**: Legacy `.eslintrc`; rejected in favor of modern ESLint flat config architecture.

## 4. Node.js Built-in Test Runner (`tests/`)
- **Decision**: Utilize `node:test` and `node:assert` for unit, property, and structural tests. Ordinary test runs validate against stored model outputs rather than making live API calls.
- **Rationale**: Ensures fast, deterministic, hermetic test execution without requiring network access or incurring API rate limits during CI/CD test runs.
- **Alternatives Considered**: Jest or Mocha; rejected to leverage Node.js built-in zero-dependency test runner capability.

## 5. Evaluation Harness & Metrics (`evals/`)
- **Decision**: Implement `evals/eval-runner.js` to process the 18 synthetic test cases in `evals/dataset.json` against the live model, validate output against schema and property rules, compute category-wise Precision, Recall, and F1, calculate Macro-F1, and output results and per-case details to `evidence/`.
- **Rationale**: Fulfills FR-009, FR-010, FR-011, FR-012, FR-013, FR-014. Threshold (macro F1 ≥ 0.70) is fixed beforehand. Ground-truth matching uses ±2 line tolerance and unique assignment.
- **Alternatives Considered**: Manual evaluation; rejected in favor of automated reproducible evaluation runner.

## 6. Failure Classification & Robustness
- **Decision**: Catch all model/service errors, schema validation errors, and evaluation errors, classifying them with run status strings (`success`, `service_error`, `invalid_model_response`, `evaluation_error`) without crashing the runner.
- **Rationale**: Complies with FR-005, FR-006, FR-014, Constitution V, ensuring clean error reporting and graceful degradation.

## Line-Number Reporting Convention

For a `missing-error-handling` finding, report the line where the risky call (such as `fetch`, OData `read`, or a Promise operation) begins, rather than a line representing the absent error handler.

The implementation prompt and evaluation logic must follow this convention so that model findings remain consistent with the dataset's ground-truth line numbers.
