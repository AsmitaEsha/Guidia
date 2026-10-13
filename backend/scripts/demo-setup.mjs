// One-time setup on a new computer (after `git clone` and `npm run demo:setup`):
//   - creates backend/.env from .env.example with fresh random sign-in secrets
//   - creates the database file and fills it with lessons and practice apps
// Safe to run again: an existing .env and existing accounts are kept.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envFile = path.join(backendDir, '.env');
const exampleFile = path.join(backendDir, '.env.example');

function run(label, args) {
  console.log(`\n▸ ${label}`);
  // Node scripts run with this same Node; Prisma runs from the project's own install.
  const res = args[0] === 'node'
    ? spawnSync(process.execPath, args.slice(1), { cwd: backendDir, stdio: 'inherit' })
    : spawnSync('npx', ['--no-install', ...args], { cwd: backendDir, stdio: 'inherit', shell: true });
  if (res.status !== 0) {
    console.error(`\n✖ ${label} failed. Fix the message above, then run "npm run demo:setup" again.`);
    process.exit(res.status || 1);
  }
}

if (fs.existsSync(envFile)) {
  console.log('▸ backend/.env already exists — keeping it.');
} else {
  const secret = () => crypto.randomBytes(48).toString('hex');
  const text = fs.readFileSync(exampleFile, 'utf8')
    .replace(/^JWT_ACCESS_SECRET=.*$/m, `JWT_ACCESS_SECRET=${secret()}`)
    .replace(/^JWT_REFRESH_SECRET=.*$/m, `JWT_REFRESH_SECRET=${secret()}`);
  fs.writeFileSync(envFile, text);
  console.log('▸ Created backend/.env with new random sign-in secrets.');
}

const env = fs.readFileSync(envFile, 'utf8');
// A value on the same line (not just "NAME=" followed by the next line).
const hasKey = (name) => new RegExp(`^${name}=[ \\t]*["']?[^\\s"'#]`, 'm').test(env);

run('Preparing the database code', ['prisma', 'generate']);
run('Creating or updating the database (existing data is kept)', ['prisma', 'migrate', 'deploy']);
run('Adding lessons, practice apps and safety content', ['node', 'prisma/seed.js']);

const aiKeys = ['GEMINI_API_KEY', 'GEMINI_API_KEYS', 'GROQ_API_KEYS', 'OPENROUTER_API_KEYS'].filter(hasKey);
console.log('\n✔ Setup finished.');
if (aiKeys.length) {
  console.log(`  AI keys found: ${aiKeys.join(', ')}`);
} else {
  console.log('  ! No AI key yet. Open backend/.env and paste a free key after GEMINI_API_KEY= and/or GROQ_API_KEYS=');
  console.log('    (Gemini: https://aistudio.google.com/apikey   Groq: https://console.groq.com/keys)');
  console.log('    Without one, Ask Guidia answers only from built-in lessons and "Understand my screen" is unavailable.');
}
console.log('\nNext:  npm run demo:build   then   npm run demo:start   then (new terminal)   npm run demo:tunnel\n');
