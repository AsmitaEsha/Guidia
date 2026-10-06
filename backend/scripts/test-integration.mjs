// Runs the API integration suite against a separate SQLite test database.
// Refuses to touch any database whose file name doesn't contain "test".
import { spawnSync } from 'node:child_process';

const url = process.env.TEST_DATABASE_URL || 'file:./guidia_test.db';
if (!/test/i.test(url)) {
  console.error(`Refusing to run integration tests against "${url}" — use a database whose name contains "test".`);
  process.exit(1);
}

const env = {
  ...process.env,
  NODE_ENV: 'test',
  DATABASE_URL: url,
  AI_PROVIDER: 'mock',
  AI_FALLBACK_PROVIDER: 'none',
  ML_SERVICE_URL: '',
  WORKER_ENABLED: 'false',
  CORS_ORIGIN: 'http://localhost:5173',
};

const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { stdio: 'inherit', env, shell: process.platform === 'win32' });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

// Non-destructive: tests create uniquely named data, so no reset is needed.
run('npx', ['prisma', 'migrate', 'deploy']);
run('node', ['prisma/seed.js']);
run('node', ['--test', '--test-concurrency=1', 'test/integration/api.test.js']);
