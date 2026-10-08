# Architecture

Guidia V2 is a modular monolith: one Express API, one SQLite database file, one Python ML service, one in-process worker, one web app and one browser extension. Nothing here needs Redis, Kafka or Kubernetes. Each boundary below can be split out later without changing callers.

## The core loop

```
                USER  ("I don't understand this")
                  │
          GuidedTaskSession  ◄─ shared context for chat, voice, screenshots, practice, safety, guardians
                  │
   ┌──────────────┼──────────────┐
  VOICE          CHAT        SCREENSHOT
   └──────────────┼──────────────┘
           AI ORCHESTRATOR
   redact → intent (HF / rules) → task context → rules → knowledge → Grok → zod
                  │
            SAFETY ENGINE  (deterministic, final authority)
          ┌───────┼────────┐
        SAFE   CONFIRM   GUARDIAN APPROVAL
          └───────┼────────┘
       SimulationActionExecutor (practice money only)
                  │
      PracticeAttempt → UserSkill → Memory Book → Progress
```

## Engineering rules

1. **AI proposes, code decides.** The model can return an `actionProposal`. The Safety Engine evaluates it, the user confirms it with deliberate controls, and only backend state-machine code executes it.
2. **No secret travels.** `security/sensitiveDataGuard.js` redacts OTPs, PINs, passwords, CVVs, card, account and ID numbers, API keys and tokens before anything is sent to AI, saved to the database, logged, emailed or shown to a guardian.
3. **The server is the source of truth.** The browser caches server state. `localStorage` holds only the signed-out UI language.
4. **Fail honestly.** If AI, voice or email isn't available, the UI says so. Nothing fakes a success.
5. **Simulation is labelled.** Practice transactions live in `SimulationAccount`/`SimulationTransaction`. The executor refuses anything that isn't a simulation.
6. **The senior owns their data.** Guardian access is scoped, consented to, revocable, and visible to the senior.

## Backend layout (`backend/src`)

| Folder | Responsibility |
|---|---|
| `config/` | Validated environment (`env.js`, feature flags, kill switches), language registry, Prisma client |
| `middleware/` | Request IDs and access logs, auth (user JWT or scoped extension token), origin guard (CSRF), per-user rate limits, idempotency, error envelope |
| `routes/` | One router per domain, mounted at `/api/v1/*` (and `/api/*` for V1 clients) |
| `services/` | Domain logic: auth, tasks, learning, progress/skills, memory, safety, actions, guardian, emergency, knowledge, conversations, vision, audit |
| `ai/` | `gateway.js` (provider-neutral), `providers/xaiProvider.js` (the only AI SDK import), `mockProvider.js`, `orchestrator.js`, `prompts.js`, `schemas.js`, `intents.js` |
| `safety/` | `rules.js` (scam signals), `riskEngine.js`, `confirmationPolicy.js`, `actionStateMachine.js`, `fusion.js` |
| `security/` | `sensitiveDataGuard.js`, `promptGuard.js` (untrusted-content fencing), `tokens.js` (hashing) |
| `actions/` | `simulationExecutor.js`, where future real-world adapters would plug in |
| `notifications/` | `notificationService` (in-app + severity policy + dedup), `outbox` (transactional email queue), SMTP provider, templates |
| `jobs/worker.js` | Outbox delivery with backoff, and expiry of screenshots, actions and tasks, plus cleanup |
| `ml/mlClient.js` | HTTP client for the ML service, with a timeout and a deterministic fallback |
| `storage/` | Ephemeral screenshot storage behind a provider interface |

## Frontend layout (`src`)

| Folder | Responsibility |
|---|---|
| `context/` | `AuthContext` (identity), `ConfigContext` (server capabilities), `PreferencesContext` (language, comfort mode, accessibility), `VoiceContext`, `NotificationContext`, `ToastContext`. `AppStateContext.useApp()` is a stateless facade kept for the simulators. |
| `services/apiClient.js` | The only HTTP client: envelope unwrapping, in-memory access token, single-flight refresh, idempotency keys |
| `pages/app/` | Senior pages: Home, Ask, Screen, Learn/Lesson, Practice, Safety, Help, People (incl. Guardian mode), Memory, Progress, Notifications, Settings, Onboarding |
| `components/shell/` | App shell and navigation |
| `components/ui/` | Design-system primitives (alerts, risk badges, dialogs, segmented controls, switches, states) |
| `styles/` | `tokens.css` (light, dark, high-contrast), `base.css`, `components.css`, `shell.css`, `pages.css` |
| `config/languages.js`, `i18n/` | Language registry and `t()` (en, bn, hi, vi) with Intl formatting |
| `components/sims/`, `demo/` | Practice simulators and their fictional fixtures |

## Request lifecycle

`requestContext` (id, timing) → helmet → CORS (exact origin list plus `ALLOWED_EXTENSION_IDS`) → JSON (1 MB limit) → route → `requireAuth` → per-user rate limit → `idempotent()` where needed → zod `parse` → service → `ok()` / error handler. Responses are `{ success: true, data }` or `{ success: false, error: { code, message, requestId } }`.

## Degraded behaviour

| Dependency down | Behaviour |
|---|---|
| xAI | Ask Guidia answers from reviewed lessons when one matches. Otherwise it shows an honest "resting" state. Screen explanation and server voice are unavailable. |
| ML service | The rule-based intent classifier is used, reported as `degraded` with no confidence number. Safety relies on rules (plus AI if available). |
| SMTP | Notifications appear in the app. Email outbox rows are recorded as `SKIPPED`, and the UI never claims an email was sent. |
| Database | `/health/ready` returns 503. |
| Browser voice for the user's language | Text only, with a message. Guidia never silently switches to an English voice. |

## Kill switches

`DISABLE_AI_CHAT`, `DISABLE_AI_VISION`, `DISABLE_VOICE` and `DISABLE_SENSITIVE_ACTIONS` take effect on the next process start without a code change. `DISABLE_SENSITIVE_ACTIONS` stops all practice payments while learning keeps working.
