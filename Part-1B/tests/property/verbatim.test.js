
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

test('dataset expected finding line numbers are valid (FR-007)', () => {
  const datasetRaw = fs.readFileSync(
    new URL('../../evals/dataset.json', import.meta.url),    'utf8'
  );
  const dataset = JSON.parse(datasetRaw);

  const positiveCases = dataset.cases.filter(
    testCase => testCase.expectedFindings?.length > 0
  );

  assert.ok(positiveCases.length > 0, 'Dataset must contain positive cases');

  for (const testCase of positiveCases) {
    const lines = testCase.input.split('\n');

    for (const finding of testCase.expectedFindings) {
      assert.ok(
        Number.isInteger(finding.line) &&
        finding.line >= 1 &&
        finding.line <= lines.length,
        `Invalid expected line ${finding.line} in case ${testCase.id}`
      );
    }
  }
});
