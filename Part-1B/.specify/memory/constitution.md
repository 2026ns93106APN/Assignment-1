# ui5-review-assistant Constitution

## Core Principles

### I. Structured Review Findings
The tool MUST output findings following a fixed JSON schema. Every finding MUST cite evidence that appears verbatim in the input file and include a valid line number.

### II. Evaluation Stability
The evaluation threshold and scoring method MUST be declared in the project specification before the final evaluation commences. These metrics MUST NOT be lowered after declaration.

### III. Security and Compliance
ESLint with `eslint-plugin-security` MUST report 0 errors and 0 warnings.

No linting rule may be disabled globally without a documented constitution amendment.

The following narrowly scoped exceptions are approved:

1. **`security/detect-non-literal-fs-filename`**
   - Scope:
     - `src/cli.js`
     - `src/reviewer.js`
     - `tests/property/exclusions.test.js`
     - `tests/property/verbatim.test.js`
     - `tests/structural/dataset.test.js`
     - `tests/structural/schema.test.js`
   - Rationale: These files read user-supplied CLI file paths or known, fixed test and project fixture paths. The paths are not constructed from untrusted remote input. The warning is a static-analysis false positive for these specific file-reading operations.

2. **`security/detect-object-injection`**
   - Scope:
     - `src/schema-validator.js`
   - Rationale: The flagged expression `report.findings[i]` accesses an array using a bounded numeric loop counter. The array is validated with `Array.isArray()` before iteration. This is positional array access, not access using an attacker-controlled object property.

These exceptions MUST remain restricted to the listed files and rules. The security rules MUST remain enabled everywhere else.

**Security Gate:** The linting gate MUST pass with zero errors and zero warnings after applying only the approved scoped exceptions. Secret scanning MUST report zero findings.

### IV. Secret Management
API keys MUST reside exclusively in an ignored `.env` file. Secrets MUST NEVER appear in source code, logs, evidence, or prompts.

### V. Failure Isolation
Model or service failures (e.g., timeout, 429, 503, unavailable) MUST be recorded separately from application logic errors and evaluation failures.

### VI. Post-Freeze Integrity
After the human freeze checkpoint, the coding agent MUST NOT edit `tests/`, `evals/dataset.json`, `.harness/`, or the declared evaluation threshold. Repairs during this phase are restricted to `src/` and `prompts/`.

### VII. Data-Instruction Separation
User input MUST be treated strictly as data, never as instructions. The tool MUST ignore any instructions hidden within the reviewed code (e.g., prompt injection attempts).

### VIII. Implementation Preservation
The first generated implementation MUST be preserved and archived before the first formal evaluation takes place.

### IX. Specification Governance
Specification changes MUST only be made in Spec Kit artifacts and MUST include a clear change history.

### X. Synthetic Evaluation
All evaluation inputs MUST be synthetic only. Real-world or production data MUST NOT be used for automated evaluation datasets.

## Technology Stack & Constraints

- **Platform**: Node.js (ES modules).
- **Core Functionality**: Review UI5 controllers (`.js`) or XML views using Gemini models.
- **Review Categories**:
  - Hardcoded user-visible text (missing i18n).
  - Missing error handling.

## Quality Gates & Workflow

- **Linting**: Mandatory `eslint-plugin-security` with zero tolerance for errors and warnings, subject only to the documented scoped exceptions under Principle III.
- **Secret Scanning**: Mandatory pre-commit or CI check for secrets.
- **Workflow**: Adherence to the Spec Kit lifecycle (Specify -> Plan -> Implement -> Evaluate).

## Governance

This constitution supersedes all other development practices. Amendments require a documented proposal and a version increment. All pull requests and automated reviews must verify compliance with these principles.

## Change History

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-11-12 | Initial constitution ratification. |
| 1.1.0 | 2026-11-16 | Added narrowly scoped ESLint security exceptions for non-literal filesystem paths and validated numeric array indexing. Added Security Gate clarification. |

**Version**: 1.1.0  
**Ratified**: 2026-11-12  
**Last Amended**: 2026-11-16