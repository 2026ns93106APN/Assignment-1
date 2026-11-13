import test from 'node:test';
import assert from 'node:assert';
import fs from 'fs';

test('verbatim evidence and valid line numbers rule (FR-007)', async () => {
  const datasetRaw = fs.readFileSync(new URL('../../evals/dataset.json', import.meta.url), 'utf8');
  const dataset = JSON.parse(datasetRaw);
  
  // Test reviewer logic against dataset cases
  const { reviewContent } = await import('../../src/reviewer.js');

  for (const testCase of dataset.cases) {
    if (testCase.expectedFindings && testCase.expectedFindings.length > 0) {
      const report = await reviewContent(testCase.input, testCase.file);
      for (const finding of report.findings) {
        // Evidence must be present in input
        assert.ok(testCase.input.includes(finding.evidence), `Evidence "${finding.evidence}" not found verbatim in input for case ${testCase.id}`);
        // Line number must be within input line count
        const lines = testCase.input.split('\n');
        assert.ok(finding.line >= 1 && finding.line <= lines.length, `Line ${finding.line} out of range for case ${testCase.id}`);
      }
    }
  }
});
