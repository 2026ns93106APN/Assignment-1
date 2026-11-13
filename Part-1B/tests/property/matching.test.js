import test from 'node:test';
import assert from 'node:assert';

test('ground-truth matching with +/- 2 line tolerance and single-match rule (FR-009)', async () => {
  const { matchFindings } = await import('../../evals/eval-runner.js');

  const expected = [{ category: 'hardcoded-text', line: 5 }];
  const actual = [{ category: 'hardcoded-text', line: 6, severity: 'medium', evidence: 'test', rationale: 'r', suggestion: 's' }];

  const matches = matchFindings(expected, actual);
  assert.strictEqual(matches.truePositives, 1);
  assert.strictEqual(matches.falsePositives, 0);
  assert.strictEqual(matches.falseNegatives, 0);
});
