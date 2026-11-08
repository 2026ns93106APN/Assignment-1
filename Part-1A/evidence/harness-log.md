# Harness Log: Part 1A (ui5-manifest-validator)

## Setup
- Agent / model used for Spec Kit and implementation: Gemini CLI, gemini-version 0.67.0. MODEL used is gemini 3.8 flash lite
- Spec Kit version, Node version: specify 1.3.3.dev0 v24.22.2 11.19.1
- Gates in the harness: secret scan, lint + security, tests
Secret scan: .harness/secret-scan.js
Lint + security: ESLint with eslint-plugin-security, using .harness/eslint.config.js
Tests: the Node test runner on tests/
All run by: npm run harness
- Pass criteria (from constitution): The project passes when every check succeeds and the results are recorded:
All required tests run and pass—none are skipped.
Lint reports no errors or warnings.
Security and secret scans report no findings.
The validator works offline and returns the right exit code: 0 for a valid file, 1 for rule violations, and 2 for a usage or execution error.
npm run harness runs the checks and saves the results.
A human reviews the results and records ACCEPT in the harness log.

## Entry 1: Review of agent-written tests before the freeze (T016a)
**Date/time:** 08/11/2026
**What I ran:** Ran the pre-implementation test suite and reviewed the tests and harness against the specification.
**What I found:** The test run showed 22 tests failing, 0 passing, and none skipped. That can be expected before the validator is implemented. The saved lint result also shows a failure because ESLint could not find the src folder.
**Why it mattered:** The failing tests provide a baseline for checking whether the later implementation meets the requirements. The lint failure shows that the lint setup needs checking once the source code exists.
**Evidence:** The pre-implementation test results, lint and security results, and secret scan results.

## Entry 2: Initial generation (Stage 2)
**What we ask the agent to do**. Tests and the harness are frozen. The agent’s job is only to write the three source files, rules.js, validator.js and cli.js, so that the already-written tests can pass. It isn’t allowed to change tests, the harness, package.json or the specs.
**What the agent reads.** Spec Kit makes it read the project documents:
the constitution (the rules, like no network access and no disabling lint),
the spec (the six rules and exit codes),
the plan (Node.js, the file layout),
the tasks (T017 to T019, the exact jobs for this step).
Our prompt also named the spec, plan and constitution directly and limited it to those tasks. Check in Gemini’s output which files it actually read.
**Why we snapshot before any check.** we wanted the agent’s first attempt preserved before any fixing. So right after it finishes, you copy the code into evidence/initial-generation/ and tag it first-generation. Only then do you run the harness. That lets a reader compare the first attempt against the final one.

The first cp failed because the folder was missing, that the tag still captured the code, and that you made the copy afterwards.

## Entry 3: Harness run 1 → result
The currently saved harness results show a failure, not a passing run:

Lint: Failed; ESLint couldn’t find src.
Secret scan: Passed with 0 findings.
Tests: Failed; 0 passed and 22 failed.

Run 1 did not pass. The secret scan passed, but lint and tests failed. The lint output says src was missing; the tests reported 22 failures. I need to rerun the harness after implementation.


