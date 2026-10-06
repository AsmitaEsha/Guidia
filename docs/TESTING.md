# Testing

| Suite | Command | What it covers |
|---|---|---|
| Backend unit tests (40) | `npm --prefix backend test` | Error envelope, duration parsing, scam rules (including "never share your OTP" counting as SAFE), sensitive-data redaction (en, bn, cards, IDs, API keys, JWTs), risk engine, confirmation levels, state machine, signal fusion |
| API integration tests (19) | `npm --prefix backend run test:integration` | Against a real SQLite database (`guidia_test.db`) with the mock AI provider: health, refresh rotation and reuse detection, CSRF origin guard, hashed reset tokens plus outbox, profile and age, Vietnamese preference, redaction before storage, scam fusion, practice payment → 2 confirmations → idempotent replay → guardian approval with a **concurrent double-approve** → single execution, guardian permission scoping, emergency dedupe plus acknowledgement rules, honest "nobody notified", persistent notification read state, vision decode check and owner-only access, extension pairing (single use, scoped), lesson completion → skill + memory, resumable practice and independence, invalid AI output rejected |
| Browser smoke + accessibility (7) | `npm run test:e2e` | Playwright on the installed Microsoft Edge (no browser download): landing walkthrough, auth pages, showcase keyboard, 404, register → onboarding → every app page, a full lesson → Memory Book, mobile navigation. axe-core (WCAG 2.1 AA, serious/critical) on every page; no horizontal scroll |
| Visual regression (39 screenshots) | `npm run test:visual` | Landing, Home, Learn, Safety, Settings at 390 / 768 / 1440 px in light, dark and high contrast. First run or after intended changes: `npm run test:visual -- --update-snapshots` |
| ML service (4) | `cd ml-service && pytest` | Health without models, no invented confidence, prediction path, input validation |
| Dataset gate | `python ml/training/check_data.py --task intent` (and `--task safety`) | Labels, languages, leakage between splits, secrets, balance |
| Frontend | `npm run lint && npm run build` | ESLint (react-hooks compiler rules) and the production build |

The integration runner (`backend/scripts/test-integration.mjs`) refuses any database whose name doesn't contain `test`. It applies migrations with `migrate deploy` (non-destructive) and seeds reference content. Tests create uniquely named users, so they don't depend on a reset.

## Manual and E2E checks performed for this release

These were run in a browser against the local stack:

- Signing in, then visiting all 13 senior pages at 1366 px and at 375 px: no error states and no page-level horizontal scroll.
- Ask Guidia with the AI provider off: the OTP was removed from the message before sending, the "AI resting" notice appeared, and the answer came from a verified lesson.
- Scam checker: the fake bKash link with urgency was rated "Stop — very risky", with reasons.
- bKash practice: Send ৳1,500 → the safety panel showed High risk, 2 checks and guardian required → two confirmations → "Waiting for your guardian" → approval through the guardian account → the simulator showed "Approved by your guardian · Practice only".

The e2e suites need the API and web dev servers (`npm run dev`); Playwright reuses them if they're already running. Set `E2E_CHANNEL=chrome` to use Chrome instead of Edge.

## Not yet automated

- E2E for the voice and screenshot-upload paths (they need microphone and file fixtures), and a 200 % text-zoom visual pass.
- Red-team fixtures for indirect prompt injection against a live model. The defences are unit-level today, with fencing and the mock provider.
- Tests against the live xAI API, which need an `XAI_API_KEY`.
