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