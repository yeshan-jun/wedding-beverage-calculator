import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('contains focused SEO metadata and the canonical URL', () => {
  const html = read('index.html');
  assert.match(html, /<title>Wedding Beverage Calculator/);
  assert.match(html, /<meta\s+name="description"[^>]+>/);
  assert.match(html, /https:\/\/yeshan-jun\.github\.io\/wedding-beverage-calculator\//);
  assert.match(html, /manifest\.webmanifest/);
});

test('contains VARIABLE1 through VARIABLE9 immediately before the closing head tag', () => {
  const html = read('index.html');
  const expected = Array.from({ length: 9 }, (_, index) => `  <!-- VARIABLE${index + 1} -->`).join('\n');
  assert.ok(html.includes(`${expected}\n</head>`));
});

test('includes a nofollow GitHub repository button and copyright-only footer', () => {
  const html = read('index.html');
  assert.match(html, /href="https:\/\/github\.com\/yeshan-jun\/wedding-beverage-calculator"/);
  assert.match(html, /rel="[^"]*nofollow[^"]*"/);
  assert.match(html, /<footer[^>]*>\s*<p>© 2026 Wedding Beverage Calculator<\/p>\s*<\/footer>/);
});

test('contains the calculator controls and result actions', () => {
  const html = read('index.html');
  for (const id of ['totalGuests', 'adults', 'children', 'nonDrinkers', 'durationHours', 'calculateButton', 'copyButton', 'printButton']) {
    assert.ok(html.includes(`id="${id}"`), `Missing #${id}`);
  }
});

test('defines an installable standalone manifest with all icon sizes', () => {
  const manifest = JSON.parse(read('public/manifest.webmanifest'));
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, '/wedding-beverage-calculator/');
  const sizes = manifest.icons.map((icon) => icon.sizes);
  assert.ok(sizes.includes('192x192'));
  assert.ok(sizes.includes('512x512'));
});

test('uses a Network First service worker with cache fallback', () => {
  const sw = read('public/sw.js');
  assert.match(sw, /fetch\(request\)/);
  assert.match(sw, /caches\.match\(request\)/);
  assert.match(sw, /caches\.match\('\.\/index\.html'\)/);
  assert.ok(sw.indexOf('fetch(request)') < sw.indexOf('caches.match(request)'));
});

test('README follows the required structure and contains at least 600 English words', () => {
  const readme = read('README.md');
  const requiredHeadings = [
    '# Wedding Beverage Calculator',
    '## Project Introduction',
    '## What It Does',
    '## How To Use',
    '## Supported Formats',
    '## Technical Details',
    '## Project Structure',
    '## Deployment',
    '## Repository',
    '## Privacy',
    '## License'
  ];

  let previousIndex = -1;
  for (const heading of requiredHeadings) {
    const currentIndex = readme.indexOf(heading);
    assert.ok(currentIndex > previousIndex, `Missing or out-of-order heading: ${heading}`);
    previousIndex = currentIndex;
  }

  const words = readme.match(/\b[A-Za-z0-9][A-Za-z0-9'’+./-]*\b/g) ?? [];
  assert.ok(words.length >= 600, `README contains only ${words.length} words`);
  assert.match(readme, /> This project is released under the MIT License\./);
});

test('repo.config.json uses the required repository configuration schema', () => {
  const config = JSON.parse(read('repo.config.json'));
  assert.deepEqual(Object.keys(config), [
    'repo_name',
    'description',
    'visibility',
    'homepage',
    'topics',
    'default_branch',
    'create_readme',
    'source_stack',
    'pages_stack'
  ]);
  assert.equal(config.repo_name, 'wedding-beverage-calculator');
  assert.equal(config.visibility, 'public');
  assert.equal(config.homepage, 'https://yeshan-jun.github.io/wedding-beverage-calculator/');
  assert.equal(config.default_branch, 'main');
  assert.equal(config.create_readme, false);
  assert.ok(Array.isArray(config.topics) && config.topics.length >= 5);
  assert.ok(config.source_stack.length > 0);
  assert.ok(config.pages_stack.length > 0);
});
