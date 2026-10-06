# Guidia V2 — Rebuild Audit

Audit date: 2026-10-05 · Branch audited: `UI-Modification` @ `5995be2` · Rebuild branch: `guidia-v2-rebuild`

## 0. Baseline

| Check | Result |
|---|---|
| Backend unit tests (`node --test`) | 14 / 14 pass (errorHandler, safety rules, duration) |
| Frontend build (`vite build`) | Passes. One 745 KB JS chunk (no code splitting), 2.1 MB `old_man.png` hero image |
| Lint (`eslint .`) | **88 errors**, 2 warnings (mostly `react-refresh/only-export-components` in data files, `set-state-in-effect`) |
| Database | Prisma 6 + SQLite (`backend/prisma/dev.db`), 7 SQLite migrations |
| Tooling available | Node 25, npm 11, Python 3.14, Docker 29. No local PostgreSQL install (verify via Docker) |
| Source size | ~13.8k lines: backend ~2.5k, frontend ~11k (incl. 1.5k CSS) |

Note: `npm` scripts fail from Git Bash on this machine (`node` not on the Windows PATH that `cmd` sees); they work from PowerShell.

## 1. What is worth preserving

These are real, working, and good foundations — the rebuild extends them rather than replacing them.

- **Auth architecture** — bcrypt(12) passwords, in-memory access JWT, httpOnly refresh cookie scoped to `/api/auth`, server-side `Session` rows, sessions revoked on password reset, "remember me" short sessions, account-enumeration-safe forgot-password.
- **Deterministic safety rule engine** (`backend/src/safety/rules.js`) — URL/spoof/urgency/credential/payment/impersonation signals; AI can only *raise* severity (`maxSeverity`). Has tests. This becomes the core of the Safety Engine.
- **Guardian consent model** — invite → PENDING → guardian accepts (email-matched) → ACTIVE; senior or guardian can revoke; approvals require ACTIVE relationship and ownership checks.
- **Psychological Safety Net** (`GuidiaSafetyPanel`) — what / who / amount / consequence + Proceed / Edit / Help, logged as `SafetyInterception`.
- **Memory Book** persistence with ownership checks; **progress** keeps confidence and competence separate.
- **Central error handler** that never leaks stack traces; `ApiError` with user-safe messages.
- **AI gateway isolation** — only `ai/gateway.js` imports an AI SDK; keys are server-only.
- **12 simulated apps** (WhatsApp, Facebook, Messenger, Gmail, bKash, Nagad, MoMo, GPay, PayPal, Booking, Practo, Amazon), button guides, UI guides, tutorials — substantial learning content that must not be lost.
- **Voice chunking / cognitive-mode pacing** (`utils/voiceGuidance.js`).
- **Extension** — explicit user-initiated capture with a consent prompt; blocks `chrome://` / `edge://` pages.

## 2. Findings

Severity: **S1** security/data-integrity, **S2** fake or broken product behaviour, **S3** architecture/maintainability, **S4** polish.

### 2.1 Security and authorization

| # | File | Current | Problem | Target | Migration |
|---|---|---|---|---|---|
| A1 S1 | `src/components/ProtectedRoute.jsx` | Non-admin routes only check `onboardingDone`; auth status is ignored | All of `/app/*` renders for signed-out users with a localStorage profile; every API call then 401s silently. The product is effectively unauthenticated on the client | `/app/*` requires `status === 'authenticated'`; onboarding is a server field | Rewrite guard; route guests to `/login`; onboarding reads `user.preference.onboardingDone` |
| A2 S1 | `backend/src/routes/screenshotRoutes.js`, `controllers/screenshotController.js`, `services/screenshotSessionStore.js` | `POST /screenshots/sessions` and `GET /sessions/:id` are **unauthenticated**; raw image held in an in-process `Map` for 30 min | Anyone with an id can fetch another user's screenshot (incl. `sourceUrl`). Not user-bound, not horizontally scalable, lost on restart | Session row in Postgres bound to `userId` (+ optional `taskSessionId`), short TTL; GET verifies owner + expiry; image held by a `StorageProvider` (ephemeral local by default) | New `ScreenshotAnalysis` model; extension authenticates with a scoped pairing token (A4) |
| A3 S1 | `backend/src/app.js` CORS | Allows any origin starting with `chrome-extension://` / `edge-extension://` | Any installed extension can make credentialed calls | `ALLOWED_EXTENSION_IDS` exact allowlist | Env-driven allowlist; dev default empty + documented |
| A4 S1 | `extension/background.js` | Calls backend with `credentials:'include'` and no auth | No identity; relies on the A2 hole | One-time pairing code from the web app → short-lived scoped extension token in `chrome.storage.session` | `ExtensionPairing` + `ExtensionToken` models, `/api/extension/*` routes |
| A5 S1 | `backend/prisma/schema.prisma` `Session.refreshToken`, `PasswordResetToken.token` | Raw tokens stored | DB read = session takeover; no rotation, no reuse detection | SHA-256 hashed tokens; refresh rotation with `familyId` and reuse detection (revoke family) | Schema change + `authService` rewrite; existing sessions invalidated by the Postgres move anyway |
| A6 S1 | `backend/src/services/authService.js` `requestPasswordReset` | Logs the reset URL with token to console in every environment | Token leakage in production logs | Log only when `NODE_ENV=development`; production sends through Notification outbox (email) | Guard + EmailProvider |
| A7 S1 | `backend/src/controllers/voiceController.js` | Public, unauthenticated proxy to `translate.google.com/translate_tts` | Undocumented third-party endpoint, ToS risk, open proxy, only en/bn/hi | xAI TTS behind auth, browser TTS fallback on client | Replace controller; provider in `ai/providers` |
| A8 S2 | `backend/src/controllers/screenshotController.js` `starterAnalysis` | When AI is missing/fails, returns hardcoded "Menu / Search / Account" elements with fixed coordinates as if analysed | Fabricated AI output shown as real | Honest `AI_UNAVAILABLE` state | Remove fallback; frontend error state |
| A9 S1 | No prompt-injection or secret redaction anywhere | User text and screenshot text go straight into prompts; `RiskAssessment.contentExcerpt` stores raw text (may contain OTP/PIN) | Secrets reach AI provider and DB | `security/sensitiveDataGuard.js` redacts before AI, persistence and logs; untrusted-content delimiters in every prompt | New module + tests; applied in orchestrator, safety, vision |
| A10 S3 | `authController.js` cookie | `sameSite:'lax'`, `secure` only in prod | OK for same-site dev; cross-site deploy needs `none`+`secure`, plus CSRF/origin check on cookie-authenticated `POST /auth/refresh` | Configurable cookie policy + Origin check on refresh/logout | `COOKIE_SAMESITE` env, `originGuard` middleware |
| A11 S3 | Rate limiting | Per-IP on auth/assistant/safety/screenshot/voice | AI endpoints not per-user, no reset-specific limit | Per-user keys for AI routes, stricter reset limiter | `middleware/rateLimits.js` |
| A12 S4 | `index.html` | Two viewport metas, one with `maximum-scale=1, user-scalable=no` | Blocks pinch-zoom — accessibility failure for older users | Single viewport meta allowing zoom | Edit |

### 2.2 Fake, mocked or misleading behaviour

| # | File | Current | Problem | Target |
|---|---|---|---|---|
| F1 S2 | `src/components/sims/BkashSim.jsx` `handleGuardianApprove` | `setTimeout(3000)` then "Guardian approved. Transfer successful." | **Hardcoded guardian approval.** No `GuardianApproval` row is created; guardians never see it | Real `ActionProposal` → Safety Engine → confirmation → `GuardianApproval` → `SimulationActionExecutor`; sim polls proposal state |
| F2 S2 | `src/components/EmergencyHelp.jsx` | Hardcoded contacts (`Son (Dhaka)`, phone numbers); SOS and "Call" are `setTimeout` toasts "All guardians notified! Help is on the way." | **Fake emergency delivery** — the most dangerous fake in the app | `EmergencyEvent` + Notification outbox + guardian dashboard; contacts come from active guardians |
| F3 S2 | `src/components/Assistant.jsx` | Mic button `setTimeout` types a canned question; screenshot button shows canned scam analysis; keyword-triggered scripted bKash flow | Fake voice input, fake vision | Real speech input (browser SpeechRecognition → xAI STT), real screenshot upload into the orchestrator, scripted flow replaced by GuidedTaskSession |
| F4 S2 | `src/components/ScreenshotAnalyzer.jsx` | `ANALYSES` table with fake "AI Confidence: 97%" and a fake 5.5 s progress bar | Demo fixtures presented with fabricated confidence | Move to `src/demo/` fixtures, labelled "Example", no confidence numbers |
| F5 S2 | `src/pages/ScreenshotExplain.jsx` `fallbackAnswer` | "Ask about this screen" answered by keyword `if` rules | Pretends to be Guidia answering | Real follow-up question to vision endpoint with the stored analysis context |
| F6 S2 | `src/context/AppStateContext.jsx` | `FAKE_TRANSACTIONS` in global state | Demo data in production state | `SimulationAccount`/`SimulationTransaction` |
| F7 S2 | `src/components/Practice.jsx` `ACHIEVEMENTS`, `SIMS[].done` | Hardcoded earned flags | Placeholder progress | Derived from `PracticeAttempt` / `UserSkill` |
| F8 S2 | `src/components/Learn.jsx` | `completed = ['tut1','tut2','tut5']` initial state | Hardcoded progress | From `UserProgress` / lesson completion API |
| F9 S2 | `src/components/Home.jsx` | "confidence score" = mean(confidence, competence) | Blends the two values the product says must stay separate | Show competence and confidence separately |
| F10 S2 | `backend/src/services/progressService.js` | Confidence = fixed number from cognitive state; competence = weighted counts | Self-described heuristic; no skill model | `UserSkill` (attempts, independent successes, hints, retention) |
| F11 S2 | `src/components/Assistant.jsx` header | "Online — always here to help" regardless of `/assistant/status` | Can claim availability when AI is not configured | Real status |
| F12 S3 | `src/data/hardcoded.js` `USERS`, `AI_RESPONSES`, `getAIResponse` | Unused canned AI responses and demo users | Dead fake-AI code | Remove after confirming no imports |

### 2.3 State ownership (duplicate truth)

| # | File | Current | Problem | Target |
|---|---|---|---|---|
| D1 S1 | `AppStateContext.jsx` | `guidia.localProfile` / `guidia.localPreferences` in localStorage; `user` falls back to local profile | Two sources of truth for identity, language, mode, font size, voice | Server is the source of truth; context only caches `useAuth().user` |
| D2 S2 | `AppStateContext.jsx` / Onboarding / Settings | `age` collected and edited, stored only in localStorage; frontend reads `authUser.age` | **`User` has no `age` column** — `authUser.age` is always `undefined`; settings "Save Profile" never reaches the server | Add `User.age Int?` (nullable, optional, never required); `PATCH /users/me` for name/age |
| D3 S2 | `AppStateContext.persistPreferences` | Sends `{ mode }` and `notificationsEnabled` to `PUT /users/me/preferences` | Schema is `.strict()` → **400**, error swallowed by `console.warn`. Comfort mode and notification toggles never persist | Send only schema fields; add `notificationsEnabled` to `UserPreference` |
| D4 S2 | `AppStateContext.jsx` notifications | Read state in a React `Set` | Everything unread after reload | `Notification.readAt` + read endpoints |
| D5 S3 | `AppStateContext.jsx` (494 lines) | Navigation, profile, prefs, notifications, transactions, memory, voice engine (module globals), theme, toast | God context; every consumer re-renders on any change | Split: `AccessibilityContext`, `VoiceContext`, `NotificationContext`, `TaskContext` + data hooks (`useMemory`, `useProgress`, …) |

### 2.4 Language / voice

| # | File | Current | Problem | Target |
|---|---|---|---|---|
| L1 S3 | 36 places across frontend + backend | `t(en, bn, hi)` positional helper, `language === 'bn' ? … : 'hi' ? …`, `z.enum(['en','bn','hi'])` | Vietnamese impossible without touching every file; many strings only have `en`/`bn` | Central registry `src/config/languages.js` + `backend/src/config/languages.js` (en, bn, hi, vi); message catalogs; `t()` keyed or object-based with fallback |
| L2 S2 | `AppStateContext.speak` | Browser `speechSynthesis` attempted **first**; backend only on failure | "xAI primary" would not be true even after swapping backend | Order: xAI TTS → browser voice only if a matching-language voice exists → text-only |
| L3 S2 | `voiceController.js` | Only first ≤180-char chunk is synthesised per request; client loops | Fine as a pattern, but the provider is the unsupported Google endpoint | xAI TTS provider, same chunked contract |
| L4 S3 | `index.html lang`, `document.documentElement.lang` | en/bn/hi only | No `vi` | Registry-driven |

### 2.5 AI layer

| # | File | Current | Problem | Target |
|---|---|---|---|---|
| I1 S3 | `backend/src/ai/gateway.js` | Gemini-only (`@google/genai`) | Provider-specific; no structured output, timeouts, retries, usage logging | Provider-neutral gateway (`generateText`, `generateStructured`, `analyzeImage`, `transcribe`, `synthesizeSpeech`) with `providers/xaiProvider.js`; timeouts/retries; `AIRequestLog` |
| I2 S3 | `screenshotController.parseAnalysis` | Strips ``` fences and `JSON.parse`s free text | Fragile | JSON-schema structured outputs + Zod validation |
| I3 S3 | `assistantService.reply` | Single-turn, no history, no task context, no intent | Not an orchestrator | `ai/orchestrator.js` pipeline: normalise → redact → intent (ML service or deterministic fallback) → task context → safety → knowledge → Grok → validate → Safety Engine |
| I4 S3 | `safetyService.getAiInterpretation` | Regex-parses `SEVERITY:` from text | Fragile | Structured output; deterministic floor kept |
| I5 S2 | Both `@google/genai` in **root** `package.json` and backend | Frontend has an AI SDK dependency | Risk of a key-bearing SDK in the client bundle; unused | Remove from root |
| I6 S3 | `backend/package.json` has `"guidia": "file:.."` | Backend depends on the frontend package | Pulls the whole frontend into backend `node_modules` | Remove |

### 2.6 Data model gaps

Missing entirely: `GuidedTaskSession`, `TaskEvent`, `Application` registry, `Lesson`/`LessonStep`, `Scenario`/`ScenarioStep`, `PracticeAttempt`, `UserSkill`, `Conversation`/`ConversationMessage`, `ScreenshotAnalysis`, `ActionProposal` (+ state machine), `EmergencyEvent`, `Notification` (+ outbox), `GuardianPermission`, `ConsentRecord`, `AuditLog`, `AIRequestLog`, `IdempotencyKey`, `SimulationAccount`/`SimulationTransaction`, `KnowledgeDocument`/`KnowledgeChunk`, extension pairing/tokens.

Other schema issues: JSON stored as `String` (`signals`, `summary`) because of SQLite; no indexes on `userId`/status columns; `GuardianRelationship.approvalThreshold` is an untyped currency amount; no `version` columns for concurrency.

### 2.7 Frontend architecture and UI

| # | File | Problem | Target |
|---|---|---|---|
| U1 S3 | `src/index.css` (1,498 lines) | Four competing themes (`:root` indigo, `light`, `guidia-app` teal, `dark`), heavy inline styles in every component, hardcoded hex colours in Learn/UIExplainer/sims | One token set (light + dark), component classes, no inline colour literals in app shell |
| U2 S4 | Many components | Emoji placeholders stripped to empty strings (`<span style={{fontSize:24}}>{d.emoji}</span>`, empty icon spans) | Remove dead spans, use Lucide icons |
| U3 S3 | `App.jsx` | All pages imported eagerly; 745 KB chunk | Route-level `lazy()` |
| U4 S4 | `Home.jsx` | 2.1 MB hero PNG | Compress to WebP (<200 KB) |
| U5 S3 | Navigation | 11 items in tablet top bar; "UI Guide" label; Emergency buried in Account | Senior nav: Home, Learn, Practice, Ask Guidia, Safety, Memory, Progress, Help; guardian mode separate; persistent "I need help" |
| U6 S3 | `Practice.jsx`, `ScreenshotAnalyzer.jsx` | `if (active === 'bkash') …` chains | Application registry maps slug → lazy sim component |
| U7 S4 | Landing | Separate visual language (Playfair, navy) from the app (teal) | Unified brand tokens |

### 2.8 Extension

`localhost` hardcoded in `background.js`, `content.js`, `manifest.json` `host_permissions`; content script injected on **all** http(s) pages, including banking pages; `language` always `'en'`; consent stored once forever in `chrome.storage.local`. Target: build-time config (`extension/config.js` generated per env), pairing auth, sensitive-domain denylist, per-capture confirmation, language from paired account.

### 2.9 Tests and CI

Only 3 unit test files; no API/integration tests, no frontend tests, no CI workflow, no ML code.

## 3. External dependencies that cannot be completed inside this repo

| Item | Needed for | Status |
|---|---|---|
| `XAI_API_KEY` | Grok text/vision/voice | Not available here — code paths built and unit-tested with a mock provider; live calls must be verified by the team |
| Managed PostgreSQL | Production DB | Verified locally with Docker `postgres:16` |
| SMTP credentials | Email notifications | `EmailProvider` built; without SMTP it records `FAILED`/`SKIPPED` honestly, never "sent" |
| GPU / Colab + curated dataset | HF intent & safety model training | Training/eval scripts, dataset schema, seed dataset and FastAPI service built; **the ~7.6k-example dataset must be curated by humans** — this plan will not auto-generate thousands of synthetic examples |
| Chrome Web Store extension ID | Production extension allowlist | Env-configurable |
