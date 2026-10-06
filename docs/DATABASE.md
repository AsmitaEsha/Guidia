# Database

Guidia uses **SQLite** through Prisma 6. The whole database is a single file, `backend/prisma/guidia.db`, so there's no database server and no Docker to install. The schema lives in `backend/prisma/schema.prisma`, and migrations in `backend/prisma/migrations/`.

## Connection

```
DATABASE_URL="file:./guidia.db"
```

The path is relative to `backend/prisma/`. The file is created automatically and is git-ignored.

## Commands

| Task | Command |
|---|---|
| Create the tables and load lessons (first run) | `npm --prefix backend run db:setup` |
| …also create the demo accounts | `SEED_DEMO_ACCOUNTS=true npm --prefix backend run db:setup` (PowerShell: `$env:SEED_DEMO_ACCOUNTS="true"` first) |
| Apply new migrations after pulling code | `npm --prefix backend run prisma:deploy` |
| Create a migration after editing the schema | `npm --prefix backend run prisma:migrate -- --name <change>` |
| Browse the data | `npx --prefix backend prisma studio` |

**Start over:** stop the API, delete `backend/prisma/guidia.db`, and run `db:setup` again. **Back up:** copy `guidia.db` while the API is stopped.

## Domains

| Area | Models |
|---|---|
| Identity | `User` (with optional `age`), `UserPreference`, `Session` (hashed token, rotation family), `PasswordResetToken` (hashed) |
| Learning | `Application` (app registry), `Lesson`, `LessonStep`, `Scenario`, `ScenarioStep`. Localised text is stored as JSON keyed by language. |
| Tasks & skills | `GuidedTaskSession`, `TaskEvent`, `PracticeAttempt`, `UserSkill`, `MemoryBookEntry` |
| Safety | `RiskAssessment` (with decision trace), `SafetyInterception`, `ActionProposal` |
| Trusted people | `GuardianRelationship`, `GuardianPermission`, `GuardianApproval`, `EmergencyEvent` |
| Messaging | `Notification` (with `readAt`, dedupe key), `OutboxEvent` |
| AI | `Conversation`, `ConversationMessage` (redacted text and provenance), `ScreenshotAnalysis`, `AIRequestLog` (metadata only), `KnowledgeDocument`, `KnowledgeChunk`, `MlModelVersion` |
| Simulation | `SimulationAccount`, `SimulationTransaction` |
| Governance | `ConsentRecord`, `AuditLog` (append-only), `IdempotencyKey`, `ExtensionPairing`, `ExtensionToken` |

Lists such as an app's country codes or an extension token's scopes are stored as JSON arrays, because SQLite has no list column type.

Rows whose state can change concurrently (`ActionProposal`, `GuardianApproval`, `GuidedTaskSession`, `EmergencyEvent`) carry a `version` column. Every transition is a conditional update on `(id, status, version)`, so double-clicks and two guardians answering at once can't apply a change twice. Multi-table operations (completing a lesson, an emergency, a guardian approval) run in one transaction.

## Limits of SQLite

SQLite is ideal for development, demos and a single-server deployment. Writes are serialised (one at a time), which is fine for a pilot or hackathon. For many simultaneous users across several servers, move to PostgreSQL:

1. In `schema.prisma`, set `provider = "postgresql"`. Optionally turn the three `Json` list fields back into `String[]`.
2. Point `DATABASE_URL` at your PostgreSQL server.
3. Generate a fresh baseline with `prisma migrate dev --name init` on an empty database.

The earlier PostgreSQL baseline is kept for reference in `backend/prisma/migrations_postgresql_archive/`.

## History

- **V1** used a SQLite file `dev.db` with seven migrations (archived in `migrations_sqlite_archive/`). V2 uses a new file, `guidia.db`, so the old `dev.db` is left untouched. Old V1 accounts are not carried over; sign up again or use the demo accounts.
- Retrieval uses keyword scoring, so no vector-database extension is needed (see [AI.md](AI.md)).
