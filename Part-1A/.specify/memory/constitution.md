<!--
### Sync Impact Report
- Version change: Unratified Scaffold ([CONSTITUTION_VERSION]) → 1.0.0
- List of modified principles:
  - [PRINCIPLE_1_NAME] → I. Deterministic Hermetic Execution & CLI Contract
  - [PRINCIPLE_2_NAME] → II. Specification-Driven Traceability & Verification
  - [PRINCIPLE_3_NAME] → III. Zero-Tolerance Code Quality & Security Standards
  - [PRINCIPLE_4_NAME] → IV. Inviolable Test Harness & Agent Boundaries
  - [PRINCIPLE_5_NAME] → V. Evidence Preservation & Baseline Provenance
- Added sections:
  - Quality Gates & Verification Standards (replaces [SECTION_2_NAME])
  - Coding Agent Guardrails & Artifact Management (replaces [SECTION_3_NAME])
- Removed sections: None
- Follow-up TODOs: None (all template placeholders resolved with concrete, measurable rules)
-->

# ui5-manifest-validator Constitution

## Core Principles

### I. Deterministic Hermetic Execution & CLI Contract
The CLI tool `ui5-manifest-validator` MUST execute completely hermetically with zero outbound or
inbound network calls during validation of SAP UI5 `manifest.json` files. Output MUST be fully
deterministic given identical inputs and configurations.

Standardized process exit codes MUST strictly follow:
- `0`: Valid manifest (all validation rules pass with no violations).
- `1`: Manifest rule violations exist (validation executed successfully, but rules failed).
- `2`: CLI usage errors or execution failures (e.g., missing input arguments, file not found,
  malformed CLI flags, or invalid JSON syntax in arguments or input files).

*Rationale*: A validator integrated into CI/CD build pipelines must provide predictable,
deterministic, and offline-capable status reporting through standardized exit codes without
external dependencies.

### II. Specification-Driven Traceability & Verification
Development and verification are strictly specification-driven:
- Every functional and validation requirement MUST have a unique requirement ID and a binary,
  testable acceptance criterion (PASS/FAIL).
- All specification-derived tests MUST pass completely before any implementation or release is
  accepted.
- Specification changes MUST be made exclusively in Spec Kit artifacts with a fully documented
  change history. Spec modifications outside of Spec Kit artifacts are strictly prohibited.

*Rationale*: Unambiguous, binary testable criteria and strict traceability between specifications
and tests eliminate subjective validation and prevent requirement drift.

### III. Zero-Tolerance Code Quality & Security Standards
The codebase MUST maintain uncompromising quality and security gates:
- ESLint MUST report exactly 0 errors and 0 warnings.
- `eslint-plugin-security` MUST report exactly 0 findings.
- No lint or security rules may be suppressed, disabled, or bypassed (e.g., via inline comments
  like `// eslint-disable`), with one documented exception: `security/detect-non-literal-fs-filename`
  is disabled for `src/validator.js` only. Rationale: the tool's purpose is to read the manifest
  paths the local user passes as arguments, so a variable path is inherent. Compensating control:
  `src/validator.js` only opens paths given as CLI arguments, never constructs paths itself, and
  never writes files.
- Zero secrets policy: No secrets, credentials, tokens, or API keys may ever be introduced or
  committed to the repository.

*Rationale*: High security assurance and clean code hygiene must be verified automatically at
all times to prevent vulnerabilities in software supply chains and enterprise tooling.

### IV. Inviolable Test Harness & Agent Boundaries
The integrity of the verification system is absolute:
- After the freeze checkpoint (T016a), the coding agent MUST NOT edit, move, or modify files
  under `tests/` or `.harness/`.
- The coding agent MUST NOT delete, comment out, or weaken existing tests.
- The coding agent MUST NOT disable or weaken lint or security configurations.
- The coding agent MUST NOT expose secrets in code, logs, or evidence artifacts.

*Rationale*: Guarding test suites and harnesses prevents automated agents from modifying the
evaluation benchmark to artificially achieve a passing state.

### V. Evidence Preservation & Baseline Provenance
The initial generated implementation MUST be captured and permanently preserved:
- The very first generated implementation MUST be preserved unchanged in `evidence/initial-generation`.
- Preserved initial-generation artifacts MUST NOT be overwritten, altered, or deleted in subsequent
  iterations.

*Rationale*: Preserving the initial generation artifact provides an immutable audit trail,
enabling objective comparative evaluation, regression analysis, and model performance tracking.

## Quality Gates & Verification Standards

To guarantee compliance prior to acceptance, every change MUST pass through the following automated
quality gates:
- **Lint Gate**: ESLint runs across all files and must exit with 0 errors and 0 warnings.
- **Security Gate**: `eslint-plugin-security` analysis must report 0 findings across all rules
  (except the documented exception in Principle III).
- **Test Gate**: 100% of specification-derived test cases must execute and pass without skipping.
- **Hermetic Check**: Automated tests must verify that manifest validation executes without network
  socket activity or HTTP requests.
- **Exit Code Verification**: Test suites must verify compliance with exit code semantics (0 for
  valid manifests, 1 for rule violations, 2 for usage errors).
- **Secret Scan Gate**: A secret-detection script in `.harness/` must scan all repository files
  and report 0 findings.
- **Harness Runner**: A single command (`npm run harness`) runs every gate and saves results to
  `evidence/`. After the automated result, the human author records an ACCEPT or REJECT
  decision in `evidence/harness-log.md`.

## Coding Agent Guardrails & Artifact Management

Automated coding agents operating within this repository are constrained by the following non-negotiable
rules:
- **Protected Paths**: `tests/`, `.harness/` (including lint and security configuration) and
  `evidence/initial-generation/` may be drafted by the coding agent during the setup and
  test-writing phases (tasks T001-T016), but only under human review. At the freeze checkpoint
  (T016a) the human author approves them and they become read-only to coding agents.
  `evidence/initial-generation/` is write-once. Any agent modification after the freeze must
  result in immediate rejection.
- **Spec Kit Lifecycle**: All functional requirements, architectural designs, and implementation
  tasks MUST be tracked in `.specify/` artifacts. Requirements must never be added, modified, or
  retired without updating Spec Kit documents and recording the change history.
- **Credential Hygiene**: Static secret detection must run on all agent-generated files before
  acceptance; any hardcoded credentials or API keys will trigger immediate failure.

## Governance

This Constitution is the foundational governing document for `ui5-manifest-validator` and supersedes
all conflicting conventions, instructions, or local development practices.

- **Amendment Procedure**: Amendments require a written entry in the Change History stating the
  rationale and impact, and explicit approval by the human author. No principle may be removed
  or weakened without that approval.
- **Versioning Policy**: The constitution strictly adheres to semantic versioning:
  - **MAJOR**: Incompatible governance shifts, principle removals, or fundamental rule alterations.
  - **MINOR**: Addition of new principles, sections, or materially expanded governance rules.
  - **PATCH**: Non-semantic clarifications, typographical corrections, or formatting adjustments.
- **Compliance Review**: All pull requests, code reviews, and automated agent activities must verify
  strict adherence to these principles. Non-compliant contributions MUST be rejected.

## Change History
- 1.0.0 (2026-11-08): Initial ratification.
- 1.1.0 (2026-11-08): Clarified protected-path ownership, added secret-scan gate and harness
  runner, replaced team governance with author approval.
- 1.1.1 (2026-11-08): Clarified the freeze point
- 1.2.0 (2026-11-08): Documented narrow exception for security/detect-non-literal-fs-filename in
  src/validator.js after harness runs 1 and 2 showed it cannot be satisfied by restructuring.

**Version**: 1.2.0 | **Ratified**: 2026-11-08 | **Last Amended**: 2026-11-08