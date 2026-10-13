// Opens a free public HTTPS link to the running demo (Cloudflare Quick
// Tunnel), checks that the link really serves Guidia, then saves a QR code.
//   1. npm run demo:start     (terminal 1, leave it open)
//   2. npm run demo:tunnel    (terminal 2, leave it open)
// The link changes every time this starts, so make the QR code on the day.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';

const port = process.env.DEMO_PORT || '10000';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const qrFile = path.join(root, 'demo-qr.png');

function findCloudflared() {
  if (process.env.CLOUDFLARED) return process.env.CLOUDFLARED;
  const local = path.join(os.homedir(), 'tools', process.platform === 'win32' ? 'cloudflared.exe' : 'cloudflared');
  return fs.existsSync(local) ? local : 'cloudflared';
}

async function ok(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    return res.ok;
  } catch {
    return false;
  }
}

if (!(await ok(`http://localhost:${port}/api/v1/health/ready`))) {
  console.error(`Guidia is not running on port ${port}. Start it first with "npm run demo:start" in another terminal.`);
  process.exit(1);
}

console.log('Opening a public link through Cloudflare…');
const tunnel = spawn(findCloudflared(), ['tunnel', '--no-autoupdate', '--url', `http://localhost:${port}`], { stdio: ['ignore', 'pipe', 'pipe'] });
tunnel.on('error', () => {
  console.error('\ncloudflared (Cloudflare\'s free tunnel program) is not installed on this computer. Install it once:');
  if (process.platform === 'win32') {
    console.error('  winget install --id Cloudflare.cloudflared      (then open a NEW terminal)');
    console.error(`  or download cloudflared-windows-amd64.exe from https://github.com/cloudflare/cloudflared/releases/latest`);
    console.error(`  and save it as ${path.join(os.homedir(), 'tools', 'cloudflared.exe')}`);
  } else if (process.platform === 'darwin') {
    console.error('  brew install cloudflared');
  } else {
    console.error('  see https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/');
  }
  console.error('Then run "npm run demo:tunnel" again.\n');
  process.exit(1);
});
tunnel.on('exit', (code) => {
  console.log(`\nThe tunnel stopped (code ${code}). The public link no longer works; run "npm run demo:tunnel" again for a new one.`);
  process.exit(code ?? 1);
});
process.on('SIGINT', () => tunnel.kill());

let found = false;
const onData = async (chunk) => {
  const text = chunk.toString();
  if (process.env.DEMO_TUNNEL_VERBOSE) process.stdout.write(text);
  const m = !found && text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
  if (!m) return;
  found = true;
  const url = m[0];
  // A new link can take a few seconds to become reachable worldwide.
  let live = false;
  for (let i = 0; i < 30 && !live; i += 1) {
    live = (await ok(`${url}/api/v1/health/ready`)) && (await ok(url));
    if (!live) await new Promise((r) => setTimeout(r, 2000));
  }
  await QRCode.toFile(qrFile, url, { width: 800, margin: 2, errorCorrectionLevel: 'M' });
  console.log(`\n  Public link:  ${url}`);
  console.log(`  Checked:      ${live ? 'the link opens Guidia and the server is ready' : 'NOT reachable yet — wait a minute and open it in a browser to check'}`);
  console.log(`  QR code:      ${qrFile}\n`);
  console.log(await QRCode.toString(url, { type: 'terminal', small: true }));
  console.log('Keep this window and the demo:start window open. Press Ctrl+C here to close the public link.');
};
tunnel.stdout.on('data', onData);
tunnel.stderr.on('data', onData);
