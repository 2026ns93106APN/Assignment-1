import { createHash } from 'node:crypto';
import test from 'node:test';
import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const cliPath = path.resolve('src/cli.js');

test('T005: Rule R-001 validation (sap.app.id)', () => {
  const result = spawnSync('node', [cliPath, 'tests/fixtures/invalid-r001.json'], { encoding: 'utf8' });
  assert.strictEqual(result.status, 1);
  assert.match(result.stdout, /FAIL R-001/);
});

test('T006: Rule R-002 validation (sap.app.type)', () => {
  const result = spawnSync('node', [cliPath, 'tests/fixtures/invalid-r002.json'], { encoding: 'utf8' });
  assert.strictEqual(result.status, 1);
  assert.match(result.stdout, /FAIL R-002/);
});

test('T007: Rule R-003 validation (sap.ui5.rootView)', () => {
  const result = spawnSync('node', [cliPath, 'tests/fixtures/invalid-r003.json'], { encoding: 'utf8' });
  assert.strictEqual(result.status, 1);
  assert.match(result.stdout, /FAIL R-003/);
});

test('T008: Rule R-004 validation (sap.ui5.models dataSources)', () => {
  const result = spawnSync('node', [cliPath, 'tests/fixtures/invalid-r004.json'], { encoding: 'utf8' });
  assert.strictEqual(result.status, 1);
  assert.match(result.stdout, /FAIL R-004/);
});

test('T009: Rule R-005 validation (minUI5Version)', () => {
  const result = spawnSync('node', [cliPath, 'tests/fixtures/invalid-r005.json'], { encoding: 'utf8' });
  assert.strictEqual(result.status, 1);
  assert.match(result.stdout, /FAIL R-005/);
});

test('T010: Rule R-006 validation (sap.app.i18n)', () => {
  const result = spawnSync('node', [cliPath, 'tests/fixtures/invalid-r006.json'], { encoding: 'utf8' });
  assert.strictEqual(result.status, 1);
  assert.match(result.stdout, /FAIL R-006/);
});

test('T011: FR-001 through FR-008 batch file processing and plain-text output format', () => {
  const result = spawnSync('node', [cliPath, 'tests/fixtures/valid.json'], { encoding: 'utf8' });
  assert.strictEqual(result.status, 0);
  assert.match(result.stdout, /tests\/fixtures\/valid\.json/);
  assert.match(result.stdout, /PASS R-001/);
  assert.match(result.stdout, /PASS R-002/);
  assert.match(result.stdout, /PASS R-003/);
  assert.match(result.stdout, /PASS R-004/);
  assert.match(result.stdout, /PASS R-005/);
  assert.match(result.stdout, /PASS R-006/);
});

test('T012: FR-009 JSON output format', () => {
  const result = spawnSync('node', [cliPath, '--json', 'tests/fixtures/valid.json'], { encoding: 'utf8' });
  assert.strictEqual(result.status, 0);
  const json = JSON.parse(result.stdout);
  assert.ok(Array.isArray(json.files));
  assert.ok(json.summary);
  assert.strictEqual(json.summary.filesChecked, 1);
  assert.strictEqual(json.summary.passed, 1);
  assert.strictEqual(json.summary.failed, 0);
});

test('T013: FR-010 Exit codes and usage errors', () => {
  // No args -> exit 2
  const resNoArgs = spawnSync('node', [cliPath], { encoding: 'utf8' });
  assert.strictEqual(resNoArgs.status, 2);

  // Missing file -> exit 2
  const resMissing = spawnSync('node', [cliPath, 'nonexistent.json'], { encoding: 'utf8' });
  assert.strictEqual(resMissing.status, 2);
});

test('T014: Duplicate path handling', () => {
  const result = spawnSync('node', [cliPath, 'tests/fixtures/valid.json', 'tests/fixtures/valid.json'], { encoding: 'utf8' });
  assert.strictEqual(result.status, 0);
  const matches = result.stdout.match(/tests\/fixtures\/valid\.json/g);
  assert.strictEqual(matches.length, 2);
});

test('T015: 50-file performance check (< 2 seconds)', () => {
  const start = Date.now();
  const args = Array(50).fill('tests/fixtures/valid.json');
  const result = spawnSync('node', [cliPath, ...args], { encoding: 'utf8' });
  const duration = Date.now() - start;
  assert.strictEqual(result.status, 0);
  assert.ok(duration < 2000, `Expected execution under 2000ms, took ${duration}ms`);
});

const run = (...args) => spawnSync('node', [cliPath, ...args], { encoding: 'utf8' });

test('T013a-1 FR-012: R-004 fails when sap.app.dataSources is missing and names the model', () => {
  const r = run('tests/fixtures/no-datasources.json');
  assert.strictEqual(r.status, 1);
  assert.match(r.stdout, /FAIL R-004:.*orders/);
});

test('T013a-2 FR-013: wrong-typed values fail R-001, R-002, R-003, R-005, R-006', () => {
  const r = run('tests/fixtures/wrong-types.json');
  assert.strictEqual(r.status, 1);
  for (const id of ['R-001', 'R-002', 'R-003', 'R-005', 'R-006']) {
    assert.ok(r.stdout.includes(`FAIL ${id}`), `${id} should FAIL`);
  }
  assert.ok(r.stdout.includes('PASS R-004'));
});

test('R-002 fails for a value outside application/component/library', () => {
  const r = run('tests/fixtures/bad-type-value.json');
  assert.strictEqual(r.status, 1);
  assert.match(r.stdout, /FAIL R-002/);
  assert.match(r.stdout, /PASS R-001/);
});

test('R-005 fails for a non-numeric version', () => {
  const r = run('tests/fixtures/bad-version.json');
  assert.strictEqual(r.status, 1);
  assert.match(r.stdout, /FAIL R-005/);
});

test('FR-010: invalid JSON and empty file are usage errors (exit 2)', () => {
  assert.strictEqual(run('tests/fixtures/invalid-syntax.json').status, 2);
  assert.strictEqual(run('tests/fixtures/empty.json').status, 2);
});

test('FR-010: unknown flag is a usage error', () => {
  assert.strictEqual(run('--bogus', 'tests/fixtures/valid.json').status, 2);
});

test('FR-010: exit 2 wins over 1 and every file is still reported', () => {
  const r = run('tests/fixtures/invalid-r001.json', 'tests/fixtures/invalid-syntax.json', 'tests/fixtures/valid.json');
  assert.strictEqual(r.status, 2);
  assert.match(r.stdout, /FAIL R-001/);
  assert.match(r.stdout, /tests\/fixtures\/valid\.json/);
});

test('FR-008: identical input gives identical, non-empty output', () => {
  const a = run('tests/fixtures/invalid-r001.json');
  const b = run('tests/fixtures/invalid-r001.json');
  assert.ok(a.stdout.length > 0);
  assert.strictEqual(a.stdout, b.stdout);
});

test('FR-008: rules are listed in ID order', () => {
  const out = run('tests/fixtures/valid.json').stdout;
  const pos = ['R-001', 'R-002', 'R-003', 'R-004', 'R-005', 'R-006'].map((id) => out.indexOf(id));
  assert.ok(pos.every((p) => p >= 0));
  assert.deepStrictEqual(pos, [...pos].sort((x, y) => x - y));
});

test('FR-009: JSON file entries carry path, status and six results', () => {
  const j = JSON.parse(run('--json', 'tests/fixtures/invalid-r001.json').stdout);
  assert.strictEqual(j.files[0].path, 'tests/fixtures/invalid-r001.json');
  assert.strictEqual(j.files[0].status, 'FAIL');
  assert.strictEqual(j.files[0].results.length, 6);
  for (const r of j.files[0].results) {
    assert.ok(['PASS', 'FAIL'].includes(r.status));
    assert.ok('id' in r && 'message' in r);
  }
  assert.strictEqual(j.summary.failed, 1);
});

test('T013b FR-011: inputs are unchanged and source uses no network modules', () => {
  const before = createHash('sha256').update(fs.readFileSync('tests/fixtures/valid.json')).digest('hex');
  const r = run('tests/fixtures/valid.json');
  assert.strictEqual(r.status, 0);
  const after = createHash('sha256').update(fs.readFileSync('tests/fixtures/valid.json')).digest('hex');
  assert.strictEqual(after, before);
  const source = [
    fs.readFileSync('src/cli.js', 'utf8'),
    fs.readFileSync('src/validator.js', 'utf8'),
    fs.readFileSync('src/rules.js', 'utf8'),
  ].join('\n');
  assert.doesNotMatch(source, /node:(http|https|http2|net|dns|tls|dgram)|from ['"](http|https|http2|net|dns|tls|dgram)['"]|\bfetch\s*\(/);
});
