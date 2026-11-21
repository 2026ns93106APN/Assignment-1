
import test from 'node:test';
import assert from 'node:assert';
import fs from 'fs';

test('verbatim evidence and valid line numbers rule (FR-007)', async () => {
  const datasetRaw = fs.readFileSync(
    new URL('../evals/dataset.json', import.meta.url),
    'utf8'
  );
  const dataset = JSON.parse(datasetRaw);

  const { reviewContent } = await import('../src/reviewer.js');

  for (const testCase of dataset.cases) {
    if (testCase.expectedFindings && testCase.expectedFindings.length > 0) {
      const report = await reviewContent(testCase.input, testCase.file);

      assert.equal(
        report.status,
        'success',
        `Review failed for case ${testCase.id}: ${report.status}`
      );

      assert.ok(
        Array.isArray(report.findings),
        `Findings must be an array for case ${testCase.id}`
      );

      assert.ok(
        report.findings.length > 0,
        `Expected at least one finding for positive case ${testCase.id}`
      );

      for (const finding of report.findings) {
        assert.ok(
          testCase.input.includes(finding.evidence),
          `Evidence "${finding.evidence}" not found verbatim in input for case ${testCase.id}`
        );

        const lines = testCase.input.split('\n');
        assert.ok(
          Number.isInteger(finding.line) &&
          finding.line >= 1 &&
          finding.line <= lines.length,
          `Line ${finding.line} out of range for case ${testCase.id}`
        );
      }
    }
  }
});
