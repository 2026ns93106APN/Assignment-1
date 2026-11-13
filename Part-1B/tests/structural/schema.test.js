import test from 'node:test';
import assert from 'node:assert';
import fs from 'fs';

test('output schema contract exists and is valid JSON', () => {
  const schemaPath = new URL('../../specs/001-ui5-review-assistant/contracts/output-schema.json', import.meta.url);
  const raw = fs.readFileSync(schemaPath, 'utf8');
  const schema = JSON.parse(raw);
  assert.strictEqual(schema.title, 'UI5ReviewReport');
  assert.ok(schema.properties.status);
  assert.ok(schema.properties.findings);
});

test('schema validator validates report correctly', async () => {
  // Importing non-existent schema-validator should fail or test validation logic
  const validatorPath = '../../src/schema-validator.js';
  const { validateReport } = await import(validatorPath);
  
  const validReport = {
    status: 'success',
    metadata: { timestamp: new Date().toISOString(), filePath: 'test.js' },
    findings: []
  };
  const result = validateReport(validReport);
  assert.strictEqual(result.valid, true);
});
