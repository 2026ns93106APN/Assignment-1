import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

fs.mkdirSync('evidence/harness-results', { recursive: true });

const gates = [
  ['secret-scan', 'node', ['secret-scan.js']],
  ['lint-security', 'npx', ['eslint', '-c', '.harness/eslint.config.js', '--max-warnings', '0', 'src', 'tests']],
  ['tests', 'node', ['--test', 'tests/**/*.test.js']],
];

let failed = false;
for (const [name, cmd, args] of gates) {
  const r = spawnSync(cmd, args, { encoding: 'utf8' });
  const status = r.status === 0 ? 'PASS' : 'FAIL';
  if (status === 'FAIL') failed = true;
  fs.writeFileSync(
    `evidence/harness-results/${name}.txt`,
    `${status}\ncommand: ${cmd} ${args.join(' ')}\n\n--- stdout ---\n${r.stdout}\n--- stderr ---\n${r.stderr}\n`,
  );
  process.stdout.write(`${status}  ${name}\n`);
}
process.exit(failed ? 1 : 0);