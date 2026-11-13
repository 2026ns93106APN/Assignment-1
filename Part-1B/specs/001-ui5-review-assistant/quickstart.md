# Quickstart Validation Guide: UI5 Code Review Assistant

**Branch**: `001-ui5-review-assistant` | **Date**: 2026-11-13

## Prerequisites
- Node.js (ES modules compatible runtime)
- Gemini API key configured in `.env` (`GEMINI_API_KEY=your_api_key_here`)

## Installation & Setup
1. Clone or open the project workspace.
2. Ensure dependencies are installed (`npm install`).
3. Configure `.env` with your Gemini API key.

## Running the Review CLI
To review a single UI5 controller or XML view file:
```bash
node src/cli.js path/to/controller.js
```

## Running the Evaluation Suite
To execute the evaluation harness against the 18 synthetic test cases in `evals/dataset.json` and output results to `evidence/`:
```bash
node evals/eval-runner.js
```

## Running Tests
To run structural, property, and unit tests using the Node.js built-in test runner:
```bash
node --test
```

## Linting
To check code compliance using ESLint flat config with `eslint-plugin-security`:
```bash
npx eslint .
```
