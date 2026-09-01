#!/usr/bin/env node
//
// Static server for local viewing. Port 8643, one above rux-ds's 8642, so both
// can run at once while a page here is compared against the reference sink.
//
// Adapted from rux-ds tools/serve.mjs. Node rather than `python3 -m
// http.server`, which cannot start under a sandboxed shell -- its parser calls
// os.getcwd() at import time.
//
// A SERVER RATHER THAN file://, and that is not a preference. Opening a page
// over file:// blocks the sprite fetch in every engine, and this project's
// pages carry icons.
//
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, normalize, join } from 'node:path';

const PORT = process.env.PORT ?? 8643;
const ROOT = process.cwd();
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
};

createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const rel = normalize(url === '/' ? '/guide.html' : url).replace(/^(\.\.[/\\])+/, '');
  const path = join(ROOT, rel);
  if (!path.startsWith(ROOT)) { res.writeHead(403).end('forbidden'); return; }
  try {
    const body = await readFile(path);
    res.writeHead(200, {
      'content-type': TYPES[extname(path)] ?? 'application/octet-stream',
      'cache-control': 'no-store',
    }).end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' }).end(`404 ${rel}`);
  }
}).listen(PORT, () => console.log(`  rux-ln-guides → http://localhost:${PORT}`));
