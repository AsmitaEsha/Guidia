# Security

## Secrets and configuration

- Secrets live only in `backend/.env` (git-ignored) or the host's secret store. `backend/src/config/env.js` validates them at startup and refuses to start in production with the placeholder JWT secrets.
- The web app receives no secrets. `VITE_API_URL` is the only `VITE_` variable.
- Logs go through `lib/logger.js`, which runs `redactObject` on every payload. Request logs contain the method, route, status, duration, user id and request id, and never bodies or headers.

## Authentication

| Control | Implementation |
|---|---|
| Passwords | bcrypt (cost 12), strength rule, constant-time dummy compare for unknown emails |
| Access token | 15-minute JWT (`typ: access`), kept in memory only |
| Refresh token | Random 384-bit value in an httpOnly cookie (`path=/api`, `Secure` in production, `SameSite` configurable). Only its SHA-256 is stored. |
| Rotation | Every refresh revokes the old token and issues a new one in the same family, keeping the family's absolute expiry |
| Reuse detection | If a rotated token is presented after a 10-second grace window, the whole family is revoked and audited |
| CSRF | `/auth/refresh` and `/auth/logout` require an allowed `Origin` (CORS alone doesn't stop form posts) |
| Password reset | 256-bit token, stored hashed, valid 30 minutes, single use (conditional update), revokes all sessions. The link is logged only when `NODE_ENV=development`. |
| Sessions | Users can list their devices and sign them out |
| Rate limits | Per IP for auth and reset; per user for assistant, vision, voice, safety, guardian, emergency and extension |

## Authorisation

Every query is scoped to its owner (`where: { id, userId }`) or checked against it. Guardian reads and writes go through `services/guardianAccess.js` (`requireGuardianScope`): there must be an ACTIVE relationship **and** the specific permission scope. Hiding a button in the UI is never treated as a security boundary. Admin routes require `role=ADMIN` and return aggregates only.

## Sensitive data

`security/sensitiveDataGuard.js` redacts the following before anything leaves the request:

| What | How it's detected |
|---|---|
| OTP, PIN, password, CVV, NID/Aadhaar, passport, bank account | A keyword nearby, in English, Bengali, Hindi or Vietnamese |
| Card numbers | Luhn check, in any script's digits |
| JWTs, API keys, bearer tokens, long hex secrets | Their shape |

The guard is applied to AI prompts, stored conversations, scam-check excerpts, Memory Book entries, emergency notes, screenshot results, TTS input and transcripts. Phone numbers and emails are deliberately kept, because they identify recipients. Tests are in `security/__tests__/`.

## AI safety

- **Prompt injection.** Untrusted content (user text, earlier user turns, screenshot text, retrieved content) is always fenced as data, under a top-priority instruction that nothing inside can change Guidia's behaviour. A heuristic detector flags likely injection attempts.
- **Excessive agency.** The model has no tools that cause side effects. It can only *describe* a proposed action. The deterministic Safety Engine evaluates it, the user confirms through the UI, and the backend state machine executes it in simulation.
- **Output handling.** Structured outputs are constrained by JSON Schema at the provider and re-validated with zod. Invalid output becomes an honest error, never a guess.
- **Scope.** Guidia refuses medical diagnosis, legal advice and investment advice, and never invents phone numbers or procedures.

## Sensitive actions

```
REVIEW → (1–3 explicit confirmations) → USER_CONFIRMED → GUARDIAN_PENDING → GUARDIAN_APPROVED → EXECUTING → EXECUTED
                                                                         ↘ REJECTED / CANCELLED / EXPIRED / FAILED
```

- `POST /actions/:id/confirm` **requires** an `Idempotency-Key`. Replays return the stored response.
- Each transition is a conditional update on `(status, version)`. Two simultaneous guardian approvals: one wins and the other gets 409 (covered by an integration test).
- `SimulationTransaction.actionProposalId` is unique, so a proposal can execute only once.
- `DISABLE_SENSITIVE_ACTIONS=true` blocks all practice payments immediately.

## Uploads

- Screenshots: an 8 MB multer limit, then sharp decodes the actual bytes (png, jpeg or webp only), with a 40-megapixel limit, EXIF removed and the image re-encoded. They are bound to their owner, expire after 30 minutes and are deleted by the worker. Only the owner can read the analysis or the image. Anonymous access, which was possible in V1, is gone.
- Audio: authenticated, 10 MB limit, allowed MIME types only, never stored.

## Browser extension

See [EXTENSION.md](EXTENSION.md): explicit capture only, pairing-code authentication with a scoped token, an exact extension-ID CORS allowlist, and sensitive sites refused.

## Audit log

`services/auditService.js` writes append-only rows for login success and failure, logout, registration, password reset, session reuse and revocation, profile changes, guardian invites, connections, revocations and permission changes, emergency creation and updates, action creation and transitions, guardian approvals and rejections, safety interceptions, AI safety decisions, extension pairing and revocation, data export and account deletion. Metadata is redacted. Inside a business transaction, an audit failure rolls the change back.

## Before production

- Set `NODE_ENV=production`, real JWT secrets, `CORS_ORIGIN`, `APP_URL`, `COOKIE_SAMESITE` (`none` if the app and API are on different sites, which also requires HTTPS) and `ALLOWED_EXTENSION_IDS`.
- Put the API behind HTTPS. `trust proxy` is enabled in production for correct client IPs.
- Run `npm audit` and `pip-audit` in CI, and review dependency updates.
