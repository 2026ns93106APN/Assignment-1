import fs from 'fs';
import path from 'path';

const patterns = [
  /AIza[0-9A-Za-z-_]{35}/,
  /bearer\s+[a-zA-Z0-9_\-\.]+/i,
  /password\s*=\s*['"][^'"]+['"]/i,
  /secret\s*=\s*['"][^'"]+['"]/i
];

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', 'evidence', '.harness', '.specify', '.gemini'].includes(entry.name)) continue;
      scanDir(fullPath);
    } else if (entry.isFile()) {
      if (['secret-scan.js', 'package-lock.json'].includes(entry.name)) continue;
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const pattern of patterns) {
        if (pattern.test(content)) {
          console.error(`Potential secret found in ${fullPath} matching pattern ${pattern}`);
          process.exit(1);
        }
      }
    }
  }
}

scanDir('.');
console.log('Secret scan passed: No secrets detected.');
