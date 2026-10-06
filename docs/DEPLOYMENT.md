# Deployment

## Topology

```
Browser ──HTTPS──► Web app (static Vite build: Vercel / Netlify / any CDN)
   │
   └──HTTPS──► API (Node 20+: Render / Railway / Fly / Cloud Run)
                 ├──► SQLite file on a persistent disk (or PostgreSQL, see DATABASE.md)
                 ├──► xAI API
                 ├──► ML service (FastAPI, private network)
                 └──► SMTP provider
```

The browser talks only to the web app and the API. It never contacts xAI, the database or the ML service directly.

## API

| Setting | Value |
|---|---|
| Build | `npm ci --prefix backend && npm --prefix backend run prisma:generate` |
| Release step | `npm --prefix backend run prisma:deploy` (never `migrate reset`) |
| Database | SQLite needs a **persistent disk** (e.g. a Render/Railway/Fly volume) mounted where `DATABASE_URL` points, such as `file:/data/guidia.db`. Without one, data is lost on redeploy. |
| Start | `npm --prefix backend start` (runs the HTTP server and the in-process worker) |
| Health | `GET /api/v1/health/live` (process) and `GET /api/v1/health/ready` (database reachable, integrations reported) |

Required environment in production: `NODE_ENV=production`, `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN`, `APP_URL`, `COOKIE_SAMESITE`.

Optional: `XAI_*`, `ML_SERVICE_URL`, `SMTP_*`, `ALLOWED_EXTENSION_IDS`, feature flags, kill switches. See `backend/.env.example`.

If the web app and API are on different registrable domains, set `COOKIE_SAMESITE=none` (this requires HTTPS). Otherwise use `lax`.

**Several API instances:** every worker job is safe to run concurrently (claims use conditional updates). Screenshot storage is local to each instance, so either keep one instance, use sticky routing for `/vision`, or add an S3-compatible `StorageProvider` before scaling out.

## Web app

```bash
VITE_API_URL=https://api.example.org/api/v1 npm run build
```

Serve `dist/` with SPA fallback to `index.html`.

## ML service

```bash
cd ml-service && pip install -r requirements.txt
```

```bash
INTENT_MODEL_DIR=/srv/models/intent/model SAFETY_MODEL_DIR=/srv/models/safety/model uvicorn app.main:app --host 0.0.0.0 --port 8001
```

Copy each trained run's folder into `/srv/models/intent` and `/srv/models/safety`. Keep the service on a private network, and set `ML_SERVICE_URL` on the API.

## Release checklist

1. CI is green (lint, unit and integration tests, build, Prisma validate, ML-service tests).
2. Back up the database file (copy `guidia.db`) and confirm the copy opens.
3. Run `prisma migrate deploy`.
4. Deploy the API and wait for `/health/ready` to return 200.
5. Deploy the web app.
6. Smoke test: sign in, ask Guidia, run a scam check, complete a practice payment with guardian approval, press "I need help" on a test account.
7. To roll back: redeploy the previous API and web build. Migrations are additive, so restore from backup only if a migration was destructive (none so far).
