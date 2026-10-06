# Data lifecycle

| Data | Where | Retention | Who can see it |
|---|---|---|---|
| Passwords | `users.passwordHash` (bcrypt) | Life of the account | Nobody |
| OTPs, PINs, CVVs, card and account numbers | **Never stored.** Redacted on arrival. | — | — |
| Refresh sessions | `sessions` (hashed) | Revoked rows deleted 7 days after expiry | The user (device list) |
| Reset tokens | `password_reset_tokens` (hashed) | 30 minutes; deleted a day after expiry | Nobody |
| Profile and preferences | `users`, `user_preferences` | Life of the account | The user |
| Conversations | `conversations`, `conversation_messages` (redacted) | Until the user deletes them, or deletes their account | The user |
| Screenshots (image) | Ephemeral storage | **30 minutes**, then deleted by the worker; "Delete now" is available | The owner |
| Screenshot explanations (text) | `screenshot_analyses.result` (redacted) | Life of the account | The owner |
| Voice recordings | Not stored; processed in memory | — | — |
| Scam checks | `risk_assessments` (redacted excerpt, max 500 chars) | Life of the account | The owner. Guardians with `SAFETY_ALERTS` see counts only. |
| Memory Book, skills, practice attempts | Respective tables | Until the user deletes them | The owner; guardians by permission |
| Notifications | `notifications` | Life of the account | The recipient |
| Emergency events | `emergency_events` | Life of the account | The senior and guardians with `EMERGENCY_ALERTS` |
| Practice money | `simulation_accounts`, `simulation_transactions` | Life of the account | The owner |
| AI call metadata | `ai_request_logs` (no prompts or replies) | Operational; prune per policy | Admins (aggregates) |
| Audit log | `audit_logs` (redacted metadata) | Per security policy. Account deletion keeps a minimal record with no personal data. | Admins |
| Idempotency keys | `idempotency_keys` | 24 hours | — |

## User rights

- **Export:** Settings → *Download my data* (`GET /users/me/export`). This returns a JSON file of the user's own records only.
- **Delete account:** Settings → *Delete my account* (`DELETE /users/me`, password required). It removes stored screenshots, revokes guardian links where the user is the guardian, and cascades through every user-owned table. An audit row records that the deletion happened.
- **Delete pieces:** conversations, Memory Book entries and screenshots can each be deleted on their own.
- **Revoke:** trusted-person permissions, the extension connection and individual sessions.

## Training data

No user data is used for model training automatically. Datasets in `ml/data` are curated by hand, and checked by `check_data.py` (which includes a secrets check). Feedback such as "this warning seems wrong" goes into the audit log for human review.

## Third parties

| Provider | What it receives | Configuration |
|---|---|---|
| xAI | Redacted prompts, relevant context only (no account history, no guardian data), and screenshots for vision | `store: false` asks xAI not to retain requests. Check xAI's current data-retention terms for your account. |
| SMTP provider | Recipient address and a template body that never contains secrets | — |
