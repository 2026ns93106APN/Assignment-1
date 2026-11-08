#!/usr/bin/env node

import { processFiles } from './validator.js';

function printUsage() {
  console.error('Usage: node src/cli.js [--json] <manifest-path> [<manifest-path>...]');
}

function main() {
  const args = process.argv.slice(2);
  let useJson = false;
  const filePaths = [];

  for (const arg of args) {
    if (arg === '--json') {
      useJson = true;
    } else if (arg.startsWith('-')) {
      console.error(`Unknown flag: ${arg}`);
      printUsage();
      process.exit(2);
    } else {
      filePaths.push(arg);
    }
  }

  if (filePaths.length === 0) {
    printUsage();
    process.exit(2);
  }

  const result = processFiles(filePaths);

  if (useJson) {
    const jsonOutput = {
      files: result.reports.map((report) => {
        if (report.isUsageError) {
          return {
            path: report.path,
            status: 'ERROR',
            error: report.error,
          };
        }
        return {
          path: report.path,
          status: report.status,
          results: report.results.map((r) => ({
            id: r.id,
            status: r.status,
            message: r.message,
          })),
        };
      }),
      summary: {
        filesChecked: result.reports.length,
        passed: result.reports.filter((r) => !r.isUsageError && r.status === 'PASS').length,
        failed: result.reports.filter((r) => r.isUsageError || r.status === 'FAIL').length,
      },
    };
    console.log(JSON.stringify(jsonOutput, null, 2));
  } else {
    const outputLines = [];
    for (const report of result.reports) {
      outputLines.push(report.path);
      if (report.isUsageError) {
        outputLines.push(`ERROR: ${report.error}`);
      } else {
        for (const r of report.results) {
          if (r.status === 'PASS') {
            outputLines.push(`PASS ${r.id}`);
          } else {
            outputLines.push(`FAIL ${r.id}: ${r.message || 'Validation failed'}`);
          }
        }
      }
    }
    console.log(outputLines.join('\n'));
  }

  process.exit(result.exitCode);
}

main();
