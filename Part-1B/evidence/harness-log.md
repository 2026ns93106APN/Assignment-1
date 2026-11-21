# Harness Log: Part 1B ui5-review-assistant

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

| Gate            | First run         | After amendment   |
|-----------------|-------------------|-------------------|
| Secret scan     | PASS              | PASS              |
| Lint + security | FAIL — 8 warnings | PASS              |
| Tests           | FAIL — 5/7 passing| FAIL — 5/7 passing|

The two test failures remained unchanged. Both were `ERR_MODULE_NOT_FOUND` errors for `evals/eval-runner.js`, which had not yet been implemented.

The lint-security gate passed after the scoped exceptions, without globally disabling the security rules.

**Evidence:**

- `.specify/memory/constitution.md` — version 1.1.0, exception documentation and Change History.
- `.harness/eslint.config.js` — two file-scoped ESLint override blocks.
- `src/schema-validator.js` — inspected numeric array-index access.
- Harness verification showing the lint-security gate passing while the secret scan remained passing.
- Separate Git commits for the constitution amendment and ESLint configuration change.

## Entry 4 — Evaluation Runner Implementation, RPM Discovery and Pacing Fix

**Date:** 16–17 November 2026

**What I ran:**

- Used `/speckit.implement` for T016 only, instructing the agent to implement `evals/eval-runner.js`.
- Specified that the implementation should provide `matchFindings`, `getSupportedLayers`, and `runEvaluation`.
- Explicitly instructed the agent not to run tests, lint, or the harness, and not to invoke `runEvaluation()` automatically.
- Reviewed the agent's tool-call transcript and the generated evaluation runner.
- Subsequently ran the tests deliberately to verify the implementation.

**What I found:**

1. **Agent exceeded the instructed scope:** Despite being explicitly told not to run tests, the agent independently executed `node --test`. This triggered unplanned live API calls. Reviewing the tool-call transcript revealed that the agent had gone beyond the requested implementation task.

2. **RPM limit discovery:** After the unplanned test execution, I checked the Google AI Studio rate-limit dashboard. The `gemini-flash-lite-latest` model had reached **16/15 requests per minute (RPM)**, exceeding the per-minute limit. The daily quota was 500 requests and was not exhausted. This showed that running all 18 evaluation cases back-to-back could cause rate-limit failures partway through the evaluation.

3. **Verbatim evidence test failure:** During the subsequent deliberate test run, `verbatim.test.js` failed on case C09. The model returned the correct code but changed its whitespace and indentation, so the evidence did not exactly match the original input. A retry of the same case with the original prompt succeeded, suggesting that the failure could be due to model non-determinism rather than a consistently reproducible issue.

4. **PASS/FAIL logic review:** I also reviewed an uncommitted change that required all 18 cases to succeed before reporting PASS. This was stricter than the existing FR-011 definition, which specifies PASS when macro-F1 is at least 0.70.

**Why it mattered:**

The agent running tests outside the explicitly requested scope demonstrated why reviewing tool-call transcripts is important, rather than relying only on the final code changes or the agent's summary. The unplanned API calls also exposed a rate-limit risk before the formal evaluation.

Without pacing, the 18-case evaluation could have exceeded the per-minute API limit and produced avoidable service errors. The C09 failure also highlighted that exact evidence preservation needed stronger prompting because the evaluation required verbatim excerpts, including original whitespace and indentation.

The PASS/FAIL review was important for maintaining consistency between the implementation and the written specification. Introducing an additional all-cases-success condition without amending FR-011 would have silently changed the acceptance criteria.

**What I changed:**

I made the following changes:

1. **Added API pacing:** Added a `sleep(4500)` delay after each case in the main evaluation loop in `evals/eval-runner.js`, allowing approximately 4.5 seconds between cases to reduce the risk of exceeding the 15 RPM limit.

2. **Strengthened the evidence instruction:** Updated `prompts/system-prompt.txt` with an explicit verbatim-evidence requirement. It instructs the model to preserve the exact original whitespace, indentation, and line breaks rather than reformatting the extracted code.

3. **Preserved the specified PASS/FAIL condition:** Reviewed and reverted the uncommitted stricter PASS/FAIL change. The evaluator continued to use the documented FR-011 condition: macro-F1 greater than or equal to 0.70.

**Evidence:**

- `evals/eval-runner.js` — evaluation functions and 4.5-second pacing delay.
- `prompts/system-prompt.txt` — verbatim evidence instruction.
- `tests/property/verbatim.test.js` — C09 exact-evidence validation.
- Google AI Studio rate-limit dashboard — observed 16/15 RPM for `gemini-flash-lite-latest`.
- Agent tool-call transcript — evidence of the unplanned `node --test` execution.
- FR-011 in the specification — original macro-F1 acceptance threshold.

## Entry 5 — Final Evaluation Results

**Date:** 17 November 2026

**What I ran:**

Ran the full `runEvaluation()` function against all 18 cases in the evaluation dataset, with the 4.5-second pacing delay in place to reduce the risk of exceeding the API's per-minute request limit.

The evaluation used the macro-F1 acceptance threshold of 0.70, established in FR-011 before the formal evaluation run.

**What I found:**

The evaluation returned the following overall result:

**Outcome: PASS**

- Macro-F1: **0.929**
- Required threshold: **0.70**
- Successful model responses: **16/18**
- Service errors: **2/18**
- Invalid model responses: **0**
- Evaluation errors: **0**

The two service errors affected:
- One `positive-hardcoded-text` XML case.
- One `mixed-category` controller.js case.

These were recorded separately under FR-014 and were not counted as review findings or review misses.

**Per-category metrics:**

| Category | Precision | Recall | F1 |
|---|---:|---:|---:|
| hardcoded-text | 1.000 | 1.000 | 1.000 |
| missing-error-handling | 0.750 | 1.000 | 0.857 |

The `hardcoded-text` category achieved perfect precision, recall, and F1 on the successfully evaluated cases.

The `missing-error-handling` category produced two false positives, both in C10 and C15.

**False-positive analysis:**

Both C10 and C15 contain an existing `.catch(error => console.error(error))` block.

According to the dataset's ground truth and FR-008, the presence of a catch block is sufficient to count as error handling. Therefore, both cases were labelled as negative or boundary cases with no expected findings.

However, the model flagged both operations because it considered console-only logging insufficient, reasoning that the error should also be handled in a way that informs the user or manages the application flow.

This represents a semantic disagreement about the meaning of error handling rather than an implementation or evaluation-scoring bug. C15 was specifically designed as a boundary case, making this a useful observation about the model's interpretation of the requirement.

**Why it mattered:**

The evaluation demonstrated that the application exceeded the required macro-F1 threshold. It also highlighted a difference between the model's interpretation of error handling and the definition used by the evaluation dataset.

Importantly, I did not change the expected findings for C10 or C15 to match the model's output after seeing the results. I retained the original ground truth and reported the false positives as measured.

This maintained the evaluation discipline required by FR-011 and Principle II: acceptance criteria and expected results should be established before evaluation, not adjusted afterwards to improve the score.

The two service errors also mean that only 16 of the 18 cases produced successful model responses. Although all 18 cases are represented in the saved results, the metrics should be interpreted with this coverage limitation in mind.

**What I changed:**

No dataset ground-truth changes or threshold adjustments were made after the evaluation.

The recorded evaluation results were retained as generated, including the two service errors and two false positives.

**Evidence:**

- `evidence/evaluation-results.json` — complete saved output from the 18-case evaluation.
- C10 — negative case incorrectly flagged for missing error handling.
- C15 — boundary case incorrectly flagged for missing error handling.
- FR-008 — definition of missing error handling.
- FR-011 — macro-F1 acceptance threshold of 0.70.
- FR-014 — separate classification of service errors, invalid responses, and evaluation errors.

## Final Decision

**Decision: ACCEPT**

I have decided to accept the UI5 Review Assistant because the final evaluation achieved a macro-F1 score of **0.929**, exceeding the predefined acceptance threshold of **0.70** specified in FR-011.

### Reasoning

The results show that the tool can identify the two supported categories with good accuracy. It achieved an F1-score of 1.000 for hardcoded text and 0.857 for missing error handling. The acceptance threshold was defined before the evaluation, and I did not change the threshold or expected findings after seeing the results. The integration issues identified during development, including the Gemini model name, API key initialization, and metadata handling, were also fixed before the formal evaluation.

The security/lint checks passed, and the evaluation results were saved as evidence.

### Limitations

Two out of 18 cases returned service errors (approximately 11.1% in this run), and the current implementation does not have retry or backoff logic. Two false positives, C10 and C15, also revealed ambiguity in FR-008: the dataset considers the presence of a `.catch()` block sufficient, while the model expects more meaningful error handling. Additionally, the evaluation was run once, and the variation observed during C09 testing shows that repeated runs may produce different results. The tool is also limited to two review categories and one input file per invocation.

### Future Improvements

Before using the tool in a production environment, I would add retry and backoff handling, clarify the FR-008 definition, and run evaluations multiple times to check consistency. I would also improve the prompt to reduce false positives and retain human review of findings before making code changes.

### Final Outcome

Based on the evaluation score, predefined acceptance criteria, completed verification checks, and documented limitations, I consider the implementation acceptable for the scope of this assignment. The remaining limitations should be addressed before using it in a production environment.


## Entry 6 – Fresh-Clone Verification

**Date:** 18 November 2026

### Objective

Verify that Part 1B can be cloned, installed, and validated independently of the original development environment.

### Steps Performed

1. Cloned the repository into a fresh directory.
2. Ran `npm install` to install dependencies.
3. Ran `npm run harness`.
4. Reviewed the saved harness output, particularly `tests.txt`.

### Results

All three harness gates reported PASS:

- Secret scan: PASS
- ESLint security checks: PASS
- Automated tests: PASS

However, reviewing the test output revealed an important limitation. The fresh clone did not contain a `.env` file, as expected because it is correctly excluded from Git. Consequently, live `reviewContent` calls failed with the error `API key should be set` and returned `service_error`.

Despite these failures, the property tests in `exclusions.test.js` and `verbatim.test.js` still passed.

### Finding and Limitation

This revealed a gap in the property test design. The tests do not currently verify that the review operation completed successfully before checking properties such as category exclusion and verbatim evidence.

As a result, these tests can pass without actually validating the findings when the Gemini API key is unavailable. In other words, the fresh-clone harness PASS confirms that the application and test suite execute without a configured API key, but it does not independently confirm that the review logic works.

The review functionality was verified separately in the original development environment, where the API key was configured, and during the final 18-case evaluation.

### Decision and Future Improvement

I identified this limitation but decided not to modify the test assertions at this stage to avoid destabilising the existing test suite close to the submission deadline.

As a future improvement, the property tests should assert `report.status === 'success'` before checking findings-based properties. They should also handle missing API credentials explicitly, with a clear skip or failure message rather than passing without validating the intended behaviour.

### Outcome

Fresh-clone verification completed, and all three harness gates passed. The limitation in the property tests was documented for future improvement rather than treated as evidence of successful live review functionality.


## Entry 7 — Follow-up: Exclusion Test Correction

**Date:** 21 November 2026

**What I reviewed:**

Revisited the limitation identified during fresh-clone verification in Entry 6. The original `exclusions.test.js` test depended on live Gemini review responses and could pass without confirming that a successful review had taken place.

**What I changed:**

Updated `tests/property/exclusions.test.js` to validate the negative-case ground truth directly from `evals/dataset.json`.

The test now:
- Loads the evaluation dataset.
- Selects cases with the `negative` type.
- Confirms that at least one negative case exists.
- Verifies that each negative case has an empty `expectedFindings` array.

This removes the live Gemini API dependency from the exclusion test and makes the dataset-contract check deterministic.

**What remains:**

`tests/property/verbatim.test.js` still depends on live Gemini review responses. It does not yet explicitly assert `report.status === 'success'` before checking the returned evidence. Therefore, the limitation identified in Entry 6 has been addressed for the exclusion test but remains for the verbatim test.

**Verification:**

Reran the Part 1B harness after the exclusion test change.

- Secret scan: PASS
- ESLint security checks: PASS
- Automated tests: PASS

**Outcome:**

The exclusion test now validates the dataset's negative-case ground truth without requiring API credentials. The remaining limitation in the verbatim test is documented as future work. The successful harness run confirms that all three configured gates passed, but does not independently establish that live Gemini review functionality works without API credentials.


## Entry 8 – Separation of Deterministic and Live Integration Tests

**Date:** 21 November 2026

### Objective

Separate deterministic property tests from live Gemini API integration tests to ensure the standard test suite can run without external API availability.

### Changes Made

- Kept `tests/property/verbatim.test.js` as a deterministic test validating expected finding line numbers in the evaluation dataset.
- Moved the live verbatim evidence and line-number test to `integration-tests/verbatim.test.js`.
- Corrected relative file paths after moving the integration test.
- Added a successful response status assertion so API failures cannot be mistaken for passing tests.
- Kept the integration test separate from the standard `npm test` command.

### Verification Results

- `npm test`: PASS – 7/7 tests.
- `npm run lint`: PASS.
- `npm run harness`: PASS – secret scan, security lint, and tests.

### Integration Test Limitation

The live Gemini integration test was attempted but encountered an HTTP 503 `UNAVAILABLE` response because the configured model was experiencing high demand. This is documented as an external service availability limitation. The integration test was not considered passed.

### Outcome

The standard test suite and harness now run successfully without requiring Gemini API availability. Live integration verification remains separate and can be retried when the service is available.