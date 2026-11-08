import fs from 'node:fs';
import { validateManifest } from './rules.js';

export function validateFile(filePath) {
  let content;
  try {
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      return {
        path: filePath,
        status: 'ERROR',
        error: 'Not a file',
        isUsageError: true,
      };
    }
    if (stats.size === 0) {
      return {
        path: filePath,
        status: 'ERROR',
        error: 'File is empty',
        isUsageError: true,
      };
    }
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    return {
      path: filePath,
      status: 'ERROR',
      error: err.message || 'File not found or unreadable',
      isUsageError: true,
    };
  }

  let manifest;
  try {
    manifest = JSON.parse(content);
  } catch (err) {
    return {
      path: filePath,
      status: 'ERROR',
      error: `Invalid JSON: ${err.message}`,
      isUsageError: true,
    };
  }

  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    return {
      path: filePath,
      status: 'ERROR',
      error: 'Manifest must be a JSON object',
      isUsageError: true,
    };
  }

  const results = validateManifest(manifest);
  const hasFailure = results.some((r) => r.status === 'FAIL');
  const status = hasFailure ? 'FAIL' : 'PASS';

  return {
    path: filePath,
    status,
    results,
    isUsageError: false,
  };
}

export function processFiles(filePaths) {
  const reports = [];
  let hasUsageError = false;
  let hasRuleViolation = false;

  for (const filePath of filePaths) {
    const report = validateFile(filePath);
    reports.push(report);
    if (report.isUsageError) {
      hasUsageError = true;
    } else if (report.status === 'FAIL') {
      hasRuleViolation = true;
    }
  }

  let exitCode = 0;
  if (hasUsageError) {
    exitCode = 2;
  } else if (hasRuleViolation) {
    exitCode = 1;
  }

  return {
    reports,
    exitCode,
    hasUsageError,
    hasRuleViolation,
  };
}
