
import test from 'node:test';
import assert from 'node:assert';
import fs from 'fs';

test('category exclusions rule (FR-008)', () => {
  const datasetRaw = fs.readFileSync(
    new URL('../../evals/dataset.json', import.meta.url),
    'utf8'
  );
  const dataset = JSON.parse(datasetRaw);

  const negativeCases = dataset.cases.filter(
  c => c.type === 'negative'
);

  assert.ok(negativeCases.length > 0, 'Dataset must contain exclusion cases');

  for (const testCase of negativeCases) {
    assert.deepStrictEqual(
      testCase.expectedFindings,
      [],
      `Exclusion case ${testCase.id} should have zero expected findings`
    );
  }
});