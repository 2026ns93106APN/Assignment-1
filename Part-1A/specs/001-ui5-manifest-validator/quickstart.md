# Quickstart Guide: UI5 Manifest Validator

**Branch**: `001-ui5-manifest-validator` | **Date**: 2026-11-08

## Prerequisites
- Node.js version 18+ installed locally.

## Setup
1. Initialize package and install dependencies (ESLint and eslint-plugin-security under `.harness/`):
   ```bash
   cd .harness && npm install
   ```

## Running Validation Scenarios

### 1. Validate a Valid Manifest (Plain Text Output)
```bash
node src/cli.js tests/fixtures/valid-manifest.json
```
*Expected Outcome*: Exit code `0`, plain-text report showing `PASS R-001` through `PASS R-006`.

### 2. Validate with JSON Output
```bash
node src/cli.js --json tests/fixtures/valid-manifest.json
```
*Expected Outcome*: Exit code `0`, JSON output with `files` array and `summary`.

### 3. Validate an Invalid Manifest (Rule Violation)
```bash
node src/cli.js tests/fixtures/invalid-r001.json
```
*Expected Outcome*: Exit code `1`, report showing `FAIL R-001` with failure message.

### 4. Trigger Usage Error (Missing Arguments or Invalid JSON)
```bash
node src/cli.js
```
*Expected Outcome*: Exit code `2`, usage error message.
