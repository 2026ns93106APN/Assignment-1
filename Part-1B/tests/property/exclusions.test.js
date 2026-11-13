import test from 'node:test';
import assert from 'node:assert';
import fs from 'fs';

test('category exclusions rule (FR-008)', async () => {
  const datasetRaw = fs.readFileSync(new URL('../../evals/dataset.json', import.meta.url), 'utf8');
  const dataset = JSON.parse(datasetRaw);
  
  const { reviewContent } = await import('../../src/reviewer.js');

  // Find a negative case
  const negativeCases = dataset.cases.filter(c => c.type === 'negative');
  for (const negCase of negativeCases) {
    const report = await reviewContent(negCase.input, negCase.file);
    // Negative cases should have 0 findings or no non-qualifying issues
    assert.strictEqual(report.findings.length, 0, `Negative case ${negCase.id} should have zero findings`);
  }
});
