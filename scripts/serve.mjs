import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = '/wedding-beverage-calculator/';
const port = Number(process.env.PORT || 4173);
const mime = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

function publicPath(relativePath) {
  const publicCandidate = path.join(root, 'public', relativePath);
  const sourceCandidate = path.join(root, relativePath);
  return relativePath.startsWith('src/') ? sourceCandidate : publicCandidate;
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);
  if (requestUrl.pathname === '/') {
    response.writeHead(302, { Location: base });
    response.end();
    return;
  }

  if (!requestUrl.pathname.startsWith(base)) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }

  let relativePath = decodeURIComponent(requestUrl.pathname.slice(base.length));
  if (!relativePath || relativePath.endsWith('/')) relativePath += 'index.html';
  if (relativePath.includes('..')) {
    response.writeHead(400);
    response.end('Bad request');
    return;
  }

  let filePath = relativePath === 'index.html' ? path.join(root, 'index.html') : publicPath(relativePath);
  try {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) filePath = path.join(filePath, 'index.html');
    const body = await fs.readFile(filePath);
    response.writeHead(200, {
      'Content-Type': mime[path.extname(filePath)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
});

server.listen(port, () => {
  console.log(`Wedding Beverage Calculator: http://localhost:${port}${base}`);
});
