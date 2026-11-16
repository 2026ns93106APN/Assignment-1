import fs from 'fs';
import path from 'path';
import { reviewContent } from '../src/reviewer.js';
import { validateReport } from '../src/schema-validator.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function matchFindings(expected = [], actual = []) {
  let truePositives = 0;
  const matchedExpected = new Set();
  const matchedActual = new Set();

  for (let i = 0; i < expected.length; i++) {
    const exp = expected[i];
    for (let j = 0; j < actual.length; j++) {
      if (matchedActual.has(j)) continue;
      const act = actual[j];
      if (act.category === exp.category && Math.abs(act.line - exp.line) <= 2) {
        matchedExpected.add(i);
        matchedActual.add(j);
        truePositives++;
        break;
      }
    }
  }

  const falsePositives = actual.length - truePositives;
  const falseNegatives = expected.length - truePositives;

  return { truePositives, falsePositives, falseNegatives };
}

export function getSupportedLayers() {
  return ['structural', 'property', 'semantic'];
}

export async function runEvaluation() {
  const datasetPath = new URL('./dataset.json', import.meta.url);
  let datasetRaw;
  try {
    datasetRaw = fs.readFileSync(datasetPath, 'utf8');
  } catch (e) {
    datasetRaw = fs.readFileSync(path.resolve('evals/dataset.json'), 'utf8');
  }

  const dataset = JSON.parse(datasetRaw);
  const cases = dataset.cases || [];

  const caseResults = [];
  const failureCounts = {
    success: 0,
    service_error: 0,
    invalid_model_response: 0,
    evaluation_error: 0
  };

  const categories = ['hardcoded-text', 'missing-error-handling'];
  const categoryStats = {};
  for (const cat of categories) {
    categoryStats[cat] = { truePositives: 0, falsePositives: 0, falseNegatives: 0 };
  }

  for (const c of cases) {
    let report;
    let status = 'success';

    try {
      report = await reviewContent(c.input, c.file);
      if (!report || typeof report !== 'object') {
        status = 'invalid_model_response';
        report = { status, metadata: { timestamp: new Date().toISOString(), filePath: c.file }, findings: [] };
      } else if (report.status && report.status !== 'success') {
        status = report.status;
      } else {
        const validation = validateReport(report);
        if (!validation.valid) {
          status = 'invalid_model_response';
          report.status = status;
        } else {
          status = report.status || 'success';
        }
      }
    } catch (err) {
      status = 'evaluation_error';
      report = {
        status,
        metadata: { timestamp: new Date().toISOString(), filePath: c.file },
        findings: []
      };
    }

    if (failureCounts[status] !== undefined) {
      failureCounts[status]++;
    } else {
      failureCounts.evaluation_error++;
    }

    const expected = c.expectedFindings || [];
const actual = report.findings || [];

let caseMatch = {
  truePositives: 0,
  falsePositives: 0,
  falseNegatives: 0
};

if (status === 'success') {
  caseMatch = matchFindings(expected, actual);

  for (const cat of categories) {
    const expCat = expected.filter(e => e.category === cat);
    const actCat = actual.filter(a => a.category === cat);
    const catMatch = matchFindings(expCat, actCat);

    categoryStats[cat].truePositives += catMatch.truePositives;
    categoryStats[cat].falsePositives += catMatch.falsePositives;
    categoryStats[cat].falseNegatives += catMatch.falseNegatives;
  }
}

    caseResults.push({
      id: c.id,
      type: c.type,
      file: c.file,
      status,
      expectedFindings: expected,
      actualFindings: actual,
      match: caseMatch
    });
    await sleep(4500);
  }

  const perCategoryMetrics = {};
  let totalF1 = 0;

  for (const cat of categories) {
    const tp = categoryStats[cat].truePositives;
    const fp = categoryStats[cat].falsePositives;
    const fn = categoryStats[cat].falseNegatives;

    const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
    const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
    const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    perCategoryMetrics[cat] = {
      truePositives: tp,
      falsePositives: fp,
      falseNegatives: fn,
      precision,
      recall,
      f1
    };
    totalF1 += f1;
  }

  const macroF1 = categories.length > 0 ? totalF1 / categories.length : 0;
  const threshold = 0.70;
  const outcome = macroF1 >= threshold ? 'PASS' : 'FAIL';

  const resultsObject = {
    timestamp: new Date().toISOString(),
    threshold,
    macroF1,
    outcome,
    failureCounts,
    perCategoryMetrics,
    caseResults
  };

  const evidenceDir = path.resolve('evidence');
  if (!fs.existsSync(evidenceDir)) {
    fs.mkdirSync(evidenceDir, { recursive: true });
  }

  const resultsPath = path.join(evidenceDir, 'evaluation-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(resultsObject, null, 2), 'utf8');

  return resultsObject;
}
