# Harness Log: Part 1B (ui5-review-assistant)

## Setup
- Agent / model used for Spec Kit and implementation: Gemini CLI. The model varied during implementation; it fell back to `gemini-3-flash-preview` or a similar preview model at some points due to quota limitations.
- Spec Kit version, Node version: Same environment as Part 1A. Refer to the Part 1A setup record (`specify --version` and `node -v`).
- Model used by the application itself for live review calls: `gemini-flash-lite-latest`. Earlier attempts using `gemini-1.5-flash` and `gemini-2.0-flash` were unsuccessful.
- Gates in the harness: Secret scan, ESLint + security checks, and automated tests.
- Pass criteria (from constitution and spec):
  - All input files must be accepted and processed.
  - Successful review responses must conform to the defined JSON schema.
  - Evidence must be copied verbatim from the input file.
  - Finding line numbers must be valid and 1-based.
  - Findings must belong only to `hardcoded-text` or `missing-error-handling`.
  - Precision, recall, and F1 must be calculated for each category.
  - Overall macro-F1 must be at least 0.70.
  - All 18 evaluation cases must be represented in the evaluation results.
  - Service errors, invalid model responses, and evaluation errors must be distinguished from review findings.
  - Evaluation results must be saved for offline inspection.

  ## Entry 1 — Pre-implementation Review

**Date:** 15 November 2026

**What I ran:**
- Reviewed the initially generated files under `src/`.
- Ran a direct smoke test using `node -e "import('./src/reviewer.js')..."` to check whether the reviewer could make a live API call.
- Temporarily added `console.error('DEBUG...')` statements inside both catch blocks to expose the underlying errors that were being hidden by the existing error handling.

**What I found:**

The initial implementation had three issues in `src/reviewer.js`:

1. **API key initialization:** `reviewer.js` instantiated `GoogleGenAI` without passing an API key. Although `cli.js` imported `dotenv/config`, `reviewer.js` did not load the environment variables itself. This meant that calling the reviewer directly did not reliably load the API key from `.env`.

2. **Unavailable model fallback:** The fallback model was hardcoded as `gemini-1.5-flash`. The API returned a 404 error indicating that this model was no longer available.

3. **Metadata integrity:** The response parsing logic allowed metadata returned by the model to overwrite the actual computed `timestamp` and `filePath`. This could result in incorrect metadata being included in an otherwise successful review response.

The first smoke test returned `service_error` without showing the underlying exception because the catch blocks swallowed the detailed error. Adding temporary debug logging helped identify the model availability issue first. After correcting the model name, the next test exposed the API key initialization issue.

**Why it mattered:**

These were integration and implementation issues, not problems with the model's review quality. If left unresolved, they could have caused every live evaluation case to fail with `service_error`. Fixing them before the formal evaluation ensured that the evaluation measured the reviewer's actual performance rather than a broken API integration. The metadata issue also mattered because the application must preserve its own file and timestamp information instead of trusting values echoed by the model.

**What I changed:**

I manually corrected all three issues in `src/reviewer.js`:

- Added `import 'dotenv/config'` so the reviewer loads environment variables directly.
- Passed `apiKey: process.env.GEMINI_API_KEY` explicitly when creating the `GoogleGenAI` instance.
- Replaced the unavailable `gemini-1.5-flash` fallback with `gemini-flash-lite-latest`.
- Updated the metadata merge logic so the application always retains its computed `timestamp` and `filePath`, regardless of what the model returns.

After confirming the fixes, I removed the temporary debug logging.

**Evidence:**
- Initial source snapshot: `evidence/initial-generation/`
- Updated implementation: `src/reviewer.js`
- Direct smoke-test output confirming a successful review response with the expected metadata and findings.

## Entry 2 — First Harness Run

**Date:** 15 November 2026

**What I ran:**

Ran `npm run harness` after the initial `src/` implementation was available.

**What I found:**

The harness produced the following results:

| Gate                |Result| Details                           |
|---------------------|------|-----------------------------------|
| Secret scan         | PASS | No secret-related issues detected.|
| Lint + security     | FAIL | 8 warnings, 0 errors.             |
| Tests               | FAIL | 5 of 7 tests passed; 2 failed.    |

The lint-security gate reported:

- **7 instances of `security/detect-non-literal-fs-filename`** across `src/cli.js`, `src/reviewer.js`, and four test files. These involved reading file paths supplied by the CLI user or using fixed test fixtures.
- **1 instance of `security/detect-object-injection`** in `src/schema-validator.js`. It flagged `report.findings[i]`, which uses a bounded numeric array index rather than a user-controlled object key.

Both test failures were `ERR_MODULE_NOT_FOUND` errors for `evals/eval-runner.js`. The evaluation runner had not been implemented yet because it belonged to a separate task. The remaining 5 tests passed.

**Why it mattered:**

The secret scan passed, but the lint-security failure required a decision. I needed to determine whether the warnings represented genuine security risks that required code restructuring or whether narrowly scoped exceptions were more appropriate.

For these specific cases, restructuring would not meaningfully improve security. The file reads were part of the intended CLI and test workflows, and the flagged array access used a bounded numeric index. The warnings therefore needed to be reviewed and documented rather than blindly suppressed.

The two test failures were due to the evaluation runner not being implemented yet, rather than defects in the existing functionality.

**What I changed:**

I reviewed the individual security warnings and identified the specific files and rules involved. This review became the basis for the subsequent constitution amendment and narrowly scoped ESLint exceptions, rather than disabling security rules globally.

I did not modify the tests to work around the missing evaluation runner, since its implementation was planned as a separate task.

**Evidence:**

- No separate, preserved raw harness-results snapshot of this specific 15 November run exists.
- `evidence/harness-results/` contains a later set of harness outputs dated 16 November; these should not be treated as the original first-run results.
- `evidence/pre-implementation-results/` contains earlier outputs dated 13 November and is not evidence of this run.
- The first-run results described above are recorded in this harness log based on the observed run.

## Entry 3 — Constitution Amendment and Scoped ESLint Exceptions

**Date:** 16 November 2026

**What I ran:**

- Reviewed the eight security warnings from the first harness run.
- Inspected the flagged array access directly using:
  `cat -n src/schema-validator.js | sed -n '30,45p'`
- Amended `.specify/memory/constitution.md`.
- Updated `.harness/eslint.config.js` with narrowly scoped overrides.
- Reran `npm run harness` to verify the changes.

**What I found:**

After reviewing the flagged code, I confirmed that the warnings were not caused by unrestricted or user-controlled access:

1. **`security/detect-non-literal-fs-filename`:** The flagged file reads in `src/cli.js`, `src/reviewer.js`, and four test files involved paths supplied through the intended CLI workflow or fixed test fixtures.

2. **`security/detect-object-injection`:** The warning in `src/schema-validator.js` was triggered by `report.findings[i]`. Inspecting the code confirmed that `i` was a numeric loop counter used to access an array element, not a user-controlled object key.

**Why it mattered:**

Disabling security rules globally would have weakened the security checks across the project. Instead, I needed a documented justification for each exception, with restrictions on exactly which files and rules were affected.

This also ensured that the exceptions were based on inspection of the actual code rather than assumptions that the warnings were false positives.

**What I changed:**

I amended `.specify/memory/constitution.md` to version **1.1.0**.

The amendment introduced two documented exceptions under Principle III:

- `security/detect-non-literal-fs-filename`, restricted to `src/cli.js`, `src/reviewer.js`, and the four reviewed test files.
- `security/detect-object-injection`, restricted to `src/schema-validator.js` for the bounded numeric array-index access.

I also added clarification to the Security Gate requirements and recorded the amendment in the constitution's Change History.

Next, I updated `.harness/eslint.config.js` with two scoped override blocks. Each override used a `files` array matching the exact file scope authorized by the constitution and disabled only its corresponding security rule.

**Verification:**

After applying the changes, I reran `npm run harness`.

| Gate | First run | After amendment |
|---|---|---|
| Secret scan | PASS | PASS |
| Lint + security | FAIL — 8 warnings | PASS |
| Tests | FAIL — 5/7 passing | FAIL — 5/7 passing |

The two test failures remained unchanged. Both were `ERR_MODULE_NOT_FOUND` errors for `evals/eval-runner.js`, which had not yet been implemented.

The lint-security gate passed after the scoped exceptions, without globally disabling the security rules.

**Evidence:**

- `.specify/memory/constitution.md` — version 1.1.0, exception documentation and Change History.
- `.harness/eslint.config.js` — two file-scoped ESLint override blocks.
- `src/schema-validator.js` — inspected numeric array-index access.
- Harness verification showing the lint-security gate passing while the secret scan remained passing.
- Separate Git commits for the constitution amendment and ESLint configuration change.