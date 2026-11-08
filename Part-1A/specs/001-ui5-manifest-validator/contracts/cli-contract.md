# Interface Contract: CLI & Outputs

**Branch**: `001-ui5-manifest-validator` | **Date**: 2026-11-08

## Command Usage

```bash
node src/cli.js [--json] <manifest-path> [<manifest-path>...]
```

### Arguments
- `<manifest-path>`: One or more file paths to SAP UI5 `manifest.json` files. Processed in the exact order given.

### Flags
- `--json`: Optional flag to output results in JSON format instead of plain text.

---

## Exit Codes

- `0`: Success. Every specified manifest file parsed successfully and passed all validation rules (R-001 through R-006).
- `1`: Rule Violation. Manifest files were successfully parsed and validated, but at least one rule violation occurred across the batch, and no usage errors occurred.
- `2`: Usage Error. Triggered by missing file arguments, unknown flags, unreadable files, missing files, zero-byte (empty) files, or invalid JSON syntax. Exit code 2 takes precedence over rule violations.

---

## Output Formats

### 1. Plain Text Output (Default)
For each file processed:
```text
path/to/manifest.json
PASS R-001
PASS R-002
PASS R-003
PASS R-004
PASS R-005
PASS R-006
```
When a rule fails:
```text
path/to/manifest.json
FAIL R-001: sap.app.id is missing or invalid
...
```

### 2. JSON Output (`--json`)
A single JSON object:
```json
{
  "files": [
    {
      "path": "tests/fixtures/valid-manifest.json",
      "status": "PASS",
      "results": [
        { "id": "R-001", "status": "PASS" },
        { "id": "R-002", "status": "PASS" },
        { "id": "R-003", "status": "PASS" },
        { "id": "R-004", "status": "PASS" },
        { "id": "R-005", "status": "PASS" },
        { "id": "R-006", "status": "PASS" }
      ]
    }
  ],
  "summary": {
    "filesChecked": 1,
    "passed": 1,
    "failed": 0
  }
}
```
