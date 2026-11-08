# Data Model: UI5 Manifest Validator

**Branch**: `001-ui5-manifest-validator` | **Date**: 2026-11-08

## Entities

### 1. Manifest Document (`Manifest`)
Represents the parsed structure of an SAP UI5 `manifest.json` file.
- **Fields**:
  - `sap.app`: Object (optional)
    - `id`: String - Application ID (evaluated by R-001)
    - `type`: String - Application type `"application" | "component" | "library"` (evaluated by R-002)
    - `i18n`: String or Object - i18n bundle configuration (evaluated by R-006)
    - `dataSources`: Object (optional) - Map of data source keys to definitions (evaluated by R-004)
  - `sap.ui5`: Object (optional)
    - `rootView`: String or Object - Root view configuration (evaluated by R-003)
    - `models`: Object (optional) - Map of model names to model configurations (evaluated by R-004)
    - `dependencies`: Object (optional)
      - `minUI5Version`: String - Minimum UI5 version (evaluated by R-005)

### 2. Validation Result (`ValidationResult`)
Represents the evaluation outcome for a single rule against a manifest file.
- **Fields**:
  - `id`: String - Rule ID (`R-001` through `R-006`)
  - `status`: String - `"PASS"` or `"FAIL"`
  - `message`: String (optional) - Description of failure when `status` is `"FAIL"`. Omitted or empty when `status` is `"PASS"`.

### 3. File Validation Report (`FileReport`)
Represents the complete validation outcome for a single manifest file.
- **Fields**:
  - `path`: String - File path as passed via CLI arguments
  - `status`: String - `"PASS"` (if all rules pass) or `"FAIL"` (if any rule fails) or `"ERROR"` (if usage/read/parse error)
  - `results`: Array of `ValidationResult` (ordered R-001 to R-006)

### 4. Batch Summary (`BatchSummary`)
Represents aggregate statistics across all processed files.
- **Fields**:
  - `filesChecked`: Number - Total number of files processed
  - `passed`: Number - Number of files passing all rules
  - `failed`: Number - Number of files with rule violations or usage errors
