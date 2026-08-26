import { readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const serverRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const roots = [join(serverRoot, 'src'), join(serverRoot, 'scripts')];
const rootFiles = [
  'server.js',
  'debug-admin.js',
  'reset-admin-password.js',
  'test-sms.js',
  'test-smtp.js',
  'verify-db-init.js',
  'verify-hash.js'
].map((file) => join(serverRoot, file));

const collectJavaScript = (directory, files = []) => {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) collectJavaScript(path, files);
    if (stats.isFile() && path.endsWith('.js')) files.push(path);
  }
  return files;
};

const files = [...rootFiles, ...roots.flatMap((root) => collectJavaScript(root))];
const failures = [];

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], {
    encoding: 'utf8',
    windowsHide: true
  });
  if (result.status !== 0) {
    failures.push({ file, output: result.stderr || result.stdout });
  }
}

if (failures.length) {
  for (const failure of failures) {
    console.error(`Syntax check failed: ${failure.file}`);
    console.error(failure.output.trim());
  }
  process.exitCode = 1;
} else {
  console.log(`Syntax check passed for ${files.length} server JavaScript files.`);
}
