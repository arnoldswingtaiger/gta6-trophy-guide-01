// A development-only static server for app/ (Node 22+, stdlib only):
//   node serve.ts [--port 8080]
// Serves app/ on http://localhost:8080 so the guide can be opened in desktop
// Chrome with no build step. It answers GET and HEAD, sends the MIME types a
// browser needs (JSON included, for the JSON-module data import), and refuses
// any path that would escape app/. Not a server for the internet.
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(fileURLToPath(new URL('./app', import.meta.url)));

function pickPort() {
  const at = process.argv.indexOf('--port');
  const n = at === -1 ? 8080 : Number(process.argv[at + 1]);
  return Number.isInteger(n) && n > 0 && n < 65536 ? n : 8080;
}

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon'],
]);

const server = createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'content-type': 'text/plain' }).end('method not allowed');
    return;
  }
  let path;
  try {
    path = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
  } catch {
    res.writeHead(400, { 'content-type': 'text/plain' }).end('bad request');
    return;
  }
  if (path.endsWith('/')) path += 'index.html';
  const file = resolve(join(appRoot, path));
  if (file !== appRoot && !file.startsWith(appRoot + sep)) {
    res.writeHead(403, { 'content-type': 'text/plain' }).end('forbidden');
    return;
  }
  let bytes;
  try {
    const info = statSync(file);
    if (!info.isFile()) throw new Error('not a file');
    bytes = info.size;
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' }).end('not found');
    return;
  }
  res.writeHead(200, {
    'content-type': contentTypes.get(extname(file).toLowerCase()) ?? 'application/octet-stream',
    'content-length': bytes,
    'cache-control': 'no-store',
  });
  if (req.method === 'GET') createReadStream(file).pipe(res);
  else res.end();
});

const port = pickPort();
server.listen(port, '127.0.0.1', () => {
  console.log(`Leonida Legend is on http://localhost:${port} (serving app/)`);
});
