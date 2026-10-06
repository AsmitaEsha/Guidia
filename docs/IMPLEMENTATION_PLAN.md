# Guidia V2 — Implementation Plan

Companion to [REBUILD_AUDIT.md](REBUILD_AUDIT.md). Each phase ends with: backend tests, frontend build, lint on touched files, docs update, one logical commit on `guidia-v2-rebuild`.

## Engineering laws (apply to every phase)

1. AI proposes, code decides. No model output executes a side effect directly.
2. No secret (OTP, PIN, password, CVV, card/account numbers, tokens) enters AI prompts, logs, analytics, guardian views, Memory Book or training data.
3. Every consequential action is previewable, confirmable, idempotent and audited.
4. Server/PostgreSQL is the source of truth; the client caches.
5. Fail honestly: unavailable means an explicit unavailable state — never fabricated output.
6. Simulation never masquerades as a real transaction.
7. The senior owns their data; guardian access is scoped, consented and revocable.
8. Modular monolith: one Express API, one Postgres, one Python ML service, one in-process worker, one frontend, one extension.

## Target architecture

```
React/Vite (UI state only; server state via hooks)
   │  /api/v1/* JSON {success,data}|{success:false,error}
Express ── middleware: requestId · helmet · CORS allowlist · auth · per-user rate limits · zod
   ├─ domains/ (routes → controllers → services → repositories)
   │    auth · users · assistant · voice · vision · learning · practice · tasks
   │    safety · actions · guardian · emergency · memory · progress · notifications · extension · admin
   ├─ ai/        gateway → providers/xaiProvider (+ mockProvider) · orchestrator · prompts · schemas · tools/registry
   ├─ ml/        mlClient (HTTP to ml-service, timeouts, deterministic fallback)
   ├─ safety/    rules (existing) · riskEngine · confirmationPolicy · actionStateMachine · fusion
   ├─ actions/   ActionExecutor → SimulationActionExecutor
   ├─ security/  sensitiveDataGuard · promptGuard · tokens (hashing)
   ├─ notifications/ service · outbox · providers/email
   ├─ jobs/      in-process scheduler: outbox delivery, expiry sweeps
   └─ Prisma → PostgreSQL
ml-service/ (FastAPI)  /health /intent /safety /embedding   ← ml/ training + data
extension/  pairing token · explicit capture · task-aware
```

## Phases

### Phase 0 — Audit & plan ✅
`docs/REBUILD_AUDIT.md`, this file, branch `guidia-v2-rebuild`.

### Phase 1 — PostgreSQL + domain schema
- `provider = "postgresql"`, `url = DATABASE_URL`, `directUrl = DIRECT_URL` (Prisma 6 — no major upgrade).
- Archive SQLite migrations to `prisma/migrations_sqlite_archive/`; new Postgres baseline migration. Dev data is disposable; production procedure documented in `docs/DATABASE.md`.
- Convert JSON-as-string columns to `Json`; add indexes and `version` columns.
- Add `User.age` (nullable) and `UserPreference.notificationsEnabled`; hashed `Session.tokenHash` + `familyId` + `replacedById`; hashed `PasswordResetToken.tokenHash`.
- New models: `Application`, `Lesson`, `LessonStep`, `Scenario`, `ScenarioStep`, `GuidedTaskSession`, `TaskEvent`, `PracticeAttempt`, `UserSkill`, `Conversation`, `ConversationMessage`, `ScreenshotAnalysis`, `ActionProposal`, `GuardianPermission`, `EmergencyEvent`, `Notification`, `OutboxEvent`, `ConsentRecord`, `AuditLog`, `AIRequestLog`, `IdempotencyKey`, `SimulationAccount`, `SimulationTransaction`, `ExtensionPairing`, `ExtensionToken`, `KnowledgeDocument`, `KnowledgeChunk`.
- `docker-compose.yml` with `postgres:16` for local dev. Seed: applications registry + demo accounts (clearly labelled).

### Phase 2 — Backend core
- `requestId` middleware, structured JSON logger with redaction (replace morgan in prod).
- Response envelope helpers; `apiClient` unwraps `data` (backward compatible during transition).
- `config/env.js` with zod validation, production-required vars, feature flags + kill switches.
- `/api/health/live`, `/api/health/ready` (DB ping, config).
- Auth hardening: token hashing, refresh rotation + reuse detection, dev-only reset logging, origin guard on cookie routes, `PATCH /users/me` (name, age).
- `AuditLog` service; `IdempotencyKey` middleware; `ownership` helpers.
- CORS: exact `CORS_ORIGIN` list + `ALLOWED_EXTENSION_IDS`.

### Phase 3 — AI gateway (xAI/Grok) + orchestrator
- `ai/providers/xaiProvider.js` (OpenAI SDK, `baseURL https://api.x.ai/v1`, Responses API, model from `XAI_MODEL`), `mockProvider.js` for tests; timeouts, bounded retries.
- `ai/gateway.js` provider-neutral: `generateText`, `generateStructured(schema)`, `analyzeImage`, `synthesizeSpeech`, `transcribe`. `AIRequestLog` (metadata only).
- `security/sensitiveDataGuard.js` (+ tests), `security/promptGuard.js` (untrusted-content fencing).
- `ai/orchestrator.js`: normalise → redact → intent → task context → deterministic safety → knowledge → Grok structured → zod validate → Safety Engine → persist redacted `ConversationMessage`.
- `ai/tools/registry.js` with risk classes; sensitive actions only via `createActionProposal`.
- Scope guard (no medical diagnosis / investment / legal advice). Grounding policy: VERIFIED / SIMULATION / USER_PROVIDED / MODEL / UNKNOWN; abstain when unknown on sensitive topics.
- Remove Gemini + `@google/genai` (root and backend).

### Phase 4 — Central i18n (en, bn, hi, vi)
- `src/config/languages.js` + `backend/src/config/languages.js` (code, nativeName, locale, currency, voice config).
- `src/i18n/` message catalogs; `t()` accepts a key or `{en,bn,hi,vi}` object with English fallback; keep the positional `t(en,bn,hi,vi)` signature working during migration.
- `src/utils/format.js` (Intl currency/number/date by locale). Replace hardcoded `৳`/`Tk` outside sims' own branding.

### Phase 5 — Voice
- Backend `/api/v1/voice/speak` (auth, xAI TTS, chunked), `/api/v1/voice/transcribe` (auth, size-limited audio, xAI STT), `/api/v1/voice/status`.
- Frontend `VoiceContext`: xAI first → browser voice only if a voice for that language exists → text only; barge-in (stop on mic press); never silently switch language.
- Real mic input in Assistant (MediaRecorder → transcribe; browser SpeechRecognition as fallback).
- Voice commands (home / back / next / repeat / slower / stop / help) handled deterministically.
- High-risk entities from voice are always confirmed visually.

### Phase 6 — ML service + intent classifier
- `ml/` : label set, `data/*.jsonl` seed (hand-written, balanced, en/bn/bn-Latn/hi/vi, held-out test), `training/train_intent.py` (XLM-R, Trainer, seed, run manifest), `training/evaluate.py` (accuracy, macro-F1, per-language F1, confusion matrix), `DATASET_CARD.md`, data-quality check script.
- `ml-service/` FastAPI: `/health`, `/intent`, `/safety`, `/embedding`; loads model if present, otherwise reports `model_loaded:false` (no invented confidences); Dockerfile; pytest.
- Backend `ml/mlClient.js` with timeout + deterministic keyword fallback marked `degraded:true`; confidence thresholds from env.

### Phase 7 — Safety classifier + fusion
- Training script reuses the intent pipeline with SAFE/SUSPICIOUS/HIGH_RISK/CRITICAL labels; seed data includes benign "never share your OTP" examples.
- `safety/fusion.js`: deterministic CRITICAL always wins; ML may raise; Grok explains only. Decision trace (policy/rule/model versions) stored on `RiskAssessment`.
- Scam result adds `UNKNOWN`, reasons, evidence, recommended action; "this warning seems wrong" feedback.

### Phase 8 — Knowledge / RAG (non-blocking)
- `KnowledgeDocument` workflow DRAFT → IN_REVIEW → PUBLISHED → ARCHIVED; seed from existing tutorials/guides.
- Retrieval v1: Postgres full-text search; pgvector + `/embedding` behind `FEATURE_RAG_VECTOR`. Provenance stored on messages.

### Phase 9 — See & Guide (vision) + extension
- `sharp` decode/normalise/strip EXIF, pixel limits; `ScreenshotAnalysis` bound to user + task; StorageProvider (local ephemeral); expiry job.
- Structured vision schema (screenType, detectedApp, userGoal, risk, summary, nextAction, requiresConfirmation, elements with optional coordinates — never fabricated).
- Follow-up questions about a screenshot go to Grok with stored context.
- Extension: env config, pairing flow, scoped token, sensitive-domain denylist, per-capture confirm, language from account.
- Demo fixtures moved to `src/demo/` and labelled "Example".

### Phase 10 — Safety action engine
- `safety/actionTypes.js`, `riskEngine.js`, `confirmationPolicy.js`, `actionStateMachine.js` (DRAFT → REVIEW → USER_CONFIRMED → GUARDIAN_PENDING → GUARDIAN_APPROVED → EXECUTING → EXECUTED | REJECTED | CANCELLED | EXPIRED | FAILED), optimistic concurrency on `version`, idempotency keys, audit.
- `actions/SimulationActionExecutor` writes `SimulationTransaction`; `DISABLE_SENSITIVE_ACTIONS` kill switch.
- bKash / Nagad / MoMo / GPay / PayPal sims use proposals instead of `setTimeout`.

### Phase 11 — Guardian, Trusted Circle, Emergency
- `GuardianPermission` scopes; senior manages and revokes; permission changes notify the senior.
- Guardian Mode: pending approvals, emergencies, permitted progress/safety only.
- `EmergencyEvent` (reasons, TRIGGERED → SENT → ACKNOWLEDGED → CONTACTED → RESOLVED / CANCELLED), idempotent; EmergencyHelp rebuilt on real guardians.
- Temporary support session (consented, scoped, auto-expiring) — data model + API.

### Phase 12 — Notifications outbox + worker
- `Notification` (+ `readAt`), `OutboxEvent` written in the same transaction as the business event; in-process worker with backoff; `EmailProvider` (nodemailer, SMTP env); severity policy and dedup.
- `GET /notifications`, `POST /:id/read`, `POST /read-all`, unread count. Replace derived notifications.

### Phase 13 — Learning, practice, skills, Memory Book
- Lessons/scenarios served from DB (seeded from `hardcoded.js` TUTORIALS / PRACTICE_TASKS); GuidedTaskSession start/resume/advance/complete; TaskEvent log.
- PracticeAttempt with hints/errors/independent flag → UserSkill (competence vs confidence, retention, nextReviewAt) in one transaction with Memory entry + progress.
- Memory Book: search, filter, star, replay, practise again, delete.

### Phase 14 — Frontend architecture
- Split `AppStateContext`; data hooks; remove localStorage product state; route-level code splitting; Application registry → lazy sim map.

### Phase 15 — Visual redesign (senior social-literacy identity)
- Single token system (light/dark/high-contrast), Noto Sans + Noto Sans Bengali/Devanagari, Inter for Latin; 8-px spacing scale; ≥48 px targets; visible focus; reduced-motion aware transitions (150–250 ms ease-out, no motion on reduced).
- Senior home: "What would you like to do?" (Learn · Ask Guidia · Understand my screen · Continue learning) + persistent "I need help"; continue learning, recent memories, safety reminder.
- Five learning domains surfaced: Digital Operations, Social Communication, Digital Safety, Information & Media Literacy, AI & Privacy Literacy.
- Responsive check at 360 / 390 / 768 / 1024 / 1440 and 200 % text.

### Phase 16 — Tests, security, CI, docs
- API integration tests (supertest against Postgres in CI), sensitive-data / prompt-injection red-team fixtures, safety fusion and state-machine tests, axe smoke test.
- `.github/workflows/ci.yml`: npm ci, lint, backend tests (Postgres service), build, `prisma validate`, ml-service pytest.
- Docs: ARCHITECTURE, DATABASE, AI, VOICE, ML, SECURITY, GUARDIAN, EXTENSION, DATA_LIFECYCLE, DEPLOYMENT, TESTING; README update; `.env.example` complete.

## Explicitly deferred (architecture prepared, not built in V2)
Coach/Organization multi-tenancy, research/pilot mode, scam intelligence network, offline PWA beyond a service-worker shell, on-device models, passkeys, hash-chained audit, realtime speech-to-speech WebSocket (REST voice ships first; realtime behind `FEATURE_REALTIME_VOICE`), generative fine-tuning (SFT/LoRA).

## Progress log (2026-10-05)

| Phase | Status | Notes |
|---|---|---|
| 0 Audit & plan | ✅ done | `docs/REBUILD_AUDIT.md`, this file |
| 1 Database + schema | ✅ done | 37 tables, lossless content seed. **Changed on 2026-10-06: switched from PostgreSQL/Docker to SQLite** (single file, no server); Postgres baseline archived. |
| 2 Backend core | ✅ done | Env validation, flags/kill switches, envelope, request IDs, health, token rotation + reuse detection, hashed tokens, CSRF origin guard, idempotency, audit |
| 3 AI gateway + orchestrator | ✅ built · ⚠️ live xAI unverified | Provider-neutral gateway, structured outputs + zod, redaction, injection fencing, grounding, knowledge fallback. Tested with the mock provider; no `XAI_API_KEY` was available. |
| 4 i18n (en/bn/hi/vi) | ✅ done for UI · ⚠️ content gaps | All new UI strings in 4 languages. V1 lessons and practice tasks have no Vietnamese and only partial Hindi; they show an English fallback with a notice. |
| 5 Voice | ✅ built · ⚠️ server voice unverified | Server → browser (matching language only) → text. Review-before-send transcripts, barge-in. xAI TTS/STT model names need confirming. Realtime not built. |
| 6 Intent classifier + ML service | ✅ pipeline · ⚠️ no trained model | Train/eval/serve code, quality gate and seed data (95/38/38). Needs a curated dataset and a GPU run. |
| 7 Safety classifier + fusion | ✅ fusion live · ⚠️ no trained model | Rules floor → ML raise → AI explain; benign "never share OTP" counted as safe; UNKNOWN instead of silent SAFE |
| 8 Knowledge / RAG | ✅ v1 | Keyword retrieval over published, versioned knowledge with provenance. pgvector deferred. |
| 9 Vision + extension | ✅ done | sharp normalisation, owner-bound expiring storage, structured analysis, follow-ups; extension rebuilt (no content script, pairing token, sensitive-site block) |
| 10 Safety action engine | ✅ done | State machine, 1–3 confirmations, idempotent confirm, simulation executor; fake bKash approval removed |
| 11 Guardian + emergency | ✅ done | Permission scopes, guardian mode, approvals, persistent emergencies with honest delivery state |
| 12 Notifications | ✅ done | Notification table + read state, transactional outbox, worker with backoff, SMTP provider (SKIPPED without config) |
| 13 Learning / practice / skills / memory | ✅ done | DB lessons in 5 literacy domains, GuidedTaskSession with events, skill model (competence ≠ confidence, mastery, spaced review), Memory Book search/star/delete |
| 14 Frontend architecture | ✅ done | Contexts split, server as source of truth, lazy routes (745 KB → 271 KB main chunk) |
| 15 Visual redesign | ✅ done | New design system and shell; checked at 375 px and 1366 px |
| 16 Tests, CI, docs | ✅ mostly | 40 unit + 17 integration + 4 ML tests, GitHub Actions, docs set. Playwright E2E and axe automation not yet. |

### Still open (needs credentials, data or a follow-up session)
- Run Grok text, vision and voice against a real `XAI_API_KEY`, and adjust `xaiProvider.js` if the provider's request shapes differ.
- Curate the intent and safety datasets towards ~100 examples per label per language; train, evaluate and deploy the models.
- Translate the V1 lesson and practice content into Hindi and Vietnamese (and finish Bengali titles), then have native speakers review all four languages.
- Translate the deterministic scam-rule reasons and guidance (currently English, while AI explanations are localised).
- Playwright E2E for the primary demo flow; axe accessibility checks; 200 % text-zoom pass.
- Simulator instrumentation (emit action ids) so wrong taps get server-side recovery hints. The step-by-step guidance and "Done" flow work today.
- An S3-compatible StorageProvider before running more than one API instance.
- Deferred by design: realtime speech-to-speech, coach/organisation multi-tenancy, research mode, the scam-intelligence network, offline PWA, passkeys.
