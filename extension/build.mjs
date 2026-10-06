// Builds a deployable copy of the extension for a given environment.
//
//   node extension/build.mjs --app https://guidia.example --api https://api.guidia.example/api/v1
//
// Output: extension/dist/ (load unpacked, or zip for the Chrome Web Store).
// The production manifest only grants access to the production API host —
// no localhost permissions ship.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const arg = (name) => { const i = process.argv.indexOf(`--${name}`); return i > -1 ? process.argv[i + 1] : null; };
const app = arg('app');
const api = arg('api');
if (!app || !api) {
  console.error('Usage: node extension/build.mjs --app <web app URL> --api <API base URL ending in /api/v1>');
  process.exit(1);
}
for (const u of [app, api]) {
  const { protocol } = new URL(u);
  if (protocol !== 'https:') { console.error(`Refusing non-HTTPS URL for production: ${u}`); process.exit(1); }
}

const out = path.join(here, 'dist');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out);
for (const file of ['background.js', 'popup.html', 'popup.js', 'popup.css']) {
  fs.copyFileSync(path.join(here, file), path.join(out, file));
}
for (const icon of ['icon.png', 'icon-16.png', 'icon-48.png']) {
  if (fs.existsSync(path.join(here, icon))) fs.copyFileSync(path.join(here, icon), path.join(out, icon));
}

fs.writeFileSync(path.join(out, 'config.js'), `export const GUIDIA_APP_URL = ${JSON.stringify(app.replace(/\/$/, ''))};\nexport const GUIDIA_API_URL = ${JSON.stringify(api.replace(/\/$/, ''))};\n`);
const manifest = JSON.parse(fs.readFileSync(path.join(here, 'manifest.json'), 'utf8'));
manifest.host_permissions = [`${new URL(api).origin}/*`];
fs.writeFileSync(path.join(out, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Built extension for ${app} → ${out}`);
console.log('After publishing, add its extension ID to ALLOWED_EXTENSION_IDS on the API.');
