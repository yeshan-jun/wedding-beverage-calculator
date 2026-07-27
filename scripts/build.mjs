import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');

await fs.rm(dist, { recursive: true, force: true });
await fs.mkdir(dist, { recursive: true });
await fs.copyFile(path.join(root, 'index.html'), path.join(dist, 'index.html'));
await fs.cp(path.join(root, 'src'), path.join(dist, 'src'), { recursive: true });
await fs.copyFile(path.join(root, 'README.md'), path.join(dist, 'README.md'));

const githubDirectory = path.join(root, '.github');
try {
  await fs.access(githubDirectory);
  await fs.cp(githubDirectory, path.join(dist, '.github'), { recursive: true });
} catch (error) {
  if (error.code !== 'ENOENT') {
    throw error;
  }
}

for (const entry of await fs.readdir(path.join(root, 'public'), { withFileTypes: true })) {
  const source = path.join(root, 'public', entry.name);
  const target = path.join(dist, entry.name);
  if (entry.isDirectory()) {
    await fs.cp(source, target, { recursive: true });
  } else {
    await fs.copyFile(source, target);
  }
}

await fs.writeFile(path.join(dist, '.nojekyll'), '');
console.log(`Built static site in ${dist}`);
