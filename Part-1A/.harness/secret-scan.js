import fs from 'node:fs';
import path from 'node:path';

const SECRET_PATTERNS = [
  /api[_-]?key['"]?\s*[:=]\s*['"][a-zA-Z0-9_\-]{16,}['"]/i,
  /password['"]?\s*[:=]\s*['"][^'"]+['"]/i,
  /secret['"]?\s*[:=]\s*['"][^'"]+['"]/i,
  /bearer\s+[a-zA-Z0-9_\-\.]{20,}/i,
  /ghp_[a-zA-Z0-9]{36}/,
  /sk_live_[0-9a-zA-Z]{24}/,
  /AIza[0-9A-Za-z_-]{35}/,
  /\bsk-[A-Za-z0-9]{32,}/,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/
];

function scanDir(dir) {
  let violations = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
            if (['node_modules', '.git'].includes(entry.name)) continue;
      violations += scanDir(fullPath);
    } else if (entry.isFile()) {
      if (entry.name === 'secret-scan.js') continue;
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const pattern of SECRET_PATTERNS) {
        if (pattern.test(content)) {
          console.error(`[SECRET SCAN FAIL] Potential secret found in ${fullPath} matching ${pattern}`);
          violations++;
        }
      }
    }
  }
  return violations;
}

const violations = scanDir('.');
if (violations > 0) {
  console.error(`Secret scan failed with ${violations} violation(s).`);
  process.exit(1);
} else {
  console.log('Secret scan passed: 0 findings.');
}
