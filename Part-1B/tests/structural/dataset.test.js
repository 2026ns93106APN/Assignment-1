import test from 'node:test';
import assert from 'node:assert';
import fs from 'fs';

test('dataset.json has exactly 18 cases in correct FR-013 distribution', () => {
  const raw = fs.readFileSync(new URL('../../evals/dataset.json', import.meta.url), 'utf8');
  const data = JSON.parse(raw);
  
  assert.ok(Array.isArray(data.cases));
  assert.strictEqual(data.cases.length, 18);

  const types = data.cases.reduce((acc, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  }, {});

  assert.strictEqual(types['positive-hardcoded-text'], 4);
  assert.strictEqual(types['positive-missing-error-handling'], 4);
  assert.strictEqual(types['negative'], 4);
  assert.strictEqual(types['boundary'], 3);
  assert.strictEqual(types['mixed-category'], 3);
});
