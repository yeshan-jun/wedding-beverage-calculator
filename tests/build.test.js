import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('npm run build copies README.md and the existing .github directory into dist', () => {
  execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: root, stdio: 'pipe' });

  assert.ok(fs.existsSync(path.join(root, 'dist', 'README.md')));
  assert.equal(
    fs.readFileSync(path.join(root, 'dist', 'README.md'), 'utf8'),
    fs.readFileSync(path.join(root, 'README.md'), 'utf8')
  );
  assert.ok(fs.existsSync(path.join(root, 'dist', '.github', 'workflows', 'deploy.yml')));
});
