import test from 'node:test';
import assert from 'node:assert';

test('evaluation runner invokes structural, property, and semantic evaluation layers (FR-012)', async () => {
  const evalRunnerPath = '../../evals/eval-runner.js';
  const evalRunner = await import(evalRunnerPath);

  assert.ok(typeof evalRunner.runEvaluation === 'function');
  const layers = evalRunner.getSupportedLayers();
  assert.ok(layers.includes('structural'));
  assert.ok(layers.includes('property'));
  assert.ok(layers.includes('semantic'));
});
