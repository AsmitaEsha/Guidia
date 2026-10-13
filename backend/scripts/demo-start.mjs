// Starts Guidia for a public demo: one server on one port serves the built
// web app (../dist) and the API together, so a single tunnel link works.
//   npm run demo:build   (once, builds the web app)
//   npm run demo:start   (then: cloudflared tunnel --url http://localhost:10000)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distIndex = path.resolve(backendDir, '../dist/index.html');
if (!fs.existsSync(distIndex)) {
  console.error('The web app is not built yet. Run "npm run demo:build" first.');
  process.exit(1);
}

// Same working directory as the normal backend, so the same database file is used.
process.chdir(backendDir);
process.env.SERVE_WEB = 'true';
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.DEMO_PORT || '10000';

await import('../src/server.js');
console.log(`\nGuidia demo is running at http://localhost:${process.env.PORT}`);
console.log(`Share it publicly with:  cloudflared tunnel --url http://localhost:${process.env.PORT}\n`);
