export function validateReport(report) {
  const errors = [];

  if (!report || typeof report !== 'object' || Array.isArray(report)) {
    return { valid: false, errors: ['Report must be an object'] };
  }

  const allowedTopKeys = ['status', 'metadata', 'findings'];
  const topKeys = Object.keys(report);
  for (const key of topKeys) {
    if (!allowedTopKeys.includes(key)) {
      errors.push(`Invalid top-level property: ${key}`);
    }
  }

  if (!report.status || !['success', 'service_error', 'invalid_model_response', 'evaluation_error'].includes(report.status)) {
    errors.push(`Invalid or missing status: ${report.status}`);
  }

  if (!report.metadata || typeof report.metadata !== 'object' || Array.isArray(report.metadata)) {
    errors.push('Missing or invalid metadata object');
  } else {
    if (typeof report.metadata.timestamp !== 'string') {
      errors.push('metadata.timestamp must be a string');
    }
    if (typeof report.metadata.filePath !== 'string') {
      errors.push('metadata.filePath must be a string');
    }
  }

  if (!Array.isArray(report.findings)) {
    errors.push('findings must be an array');
  } else {
    for (let i = 0; i < report.findings.length; i++) {
      const f = report.findings[i];
      if (!f || typeof f !== 'object' || Array.isArray(f)) {
        errors.push(`Finding at index ${i} must be an object`);
        continue;
      }
      const allowedFindingKeys = ['category', 'line', 'severity', 'evidence', 'rationale', 'suggestion'];
      for (const key of Object.keys(f)) {
        if (!allowedFindingKeys.includes(key)) {
          errors.push(`Finding at index ${i} has invalid property: ${key}`);
        }
      }
      if (!['hardcoded-text', 'missing-error-handling'].includes(f.category)) {
        errors.push(`Finding at index ${i} has invalid category: ${f.category}`);
      }
      if (typeof f.line !== 'number' || !Number.isInteger(f.line) || f.line < 1) {
        errors.push(`Finding at index ${i} has invalid line number: ${f.line}`);
      }
      if (!['low', 'medium', 'high'].includes(f.severity)) {
        errors.push(`Finding at index ${i} has invalid severity: ${f.severity}`);
      }
      if (typeof f.evidence !== 'string' || f.evidence.length < 1) {
        errors.push(`Finding at index ${i} has invalid evidence`);
      }
      if (typeof f.rationale !== 'string' || f.rationale.length < 1) {
        errors.push(`Finding at index ${i} has invalid rationale`);
      }
      if (typeof f.suggestion !== 'string' || f.suggestion.length < 1) {
        errors.push(`Finding at index ${i} has invalid suggestion`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
