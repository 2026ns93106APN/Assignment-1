#!/usr/bin/env node
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { reviewFile } from './reviewer.js';

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node src/cli.js <path-to-ui5-file>');
    process.exit(1);
  }

  const filePath = args[0];
  const fullPath = path.resolve(filePath);

  if (!fs.existsSync(fullPath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  try {
    const report = await reviewFile(fullPath);
    console.log(JSON.stringify(report, null, 2));

    if (report.status === 'service_error' || report.status === 'invalid_model_response' || report.status === 'evaluation_error') {
      process.exit(2);
    } else {
      process.exit(0);
    }
  } catch (err) {
    const errorReport = {
      status: 'service_error',
      metadata: {
        timestamp: new Date().toISOString(),
        filePath
      },
      findings: []
    };
    console.log(JSON.stringify(errorReport, null, 2));
    process.exit(2);
  }
}

main();
