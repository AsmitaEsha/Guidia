# Archived SQLite migrations (Guidia V1)

These migrations built the original SQLite development database. They are
kept for history only and are **not** applied to PostgreSQL — SQLite DDL is
not portable and V2 changes most tables (JSON columns, hashed tokens, new
domains). Guidia V2 starts from the PostgreSQL baseline in `../migrations/`.

See `docs/DATABASE.md` → "Migrating from the V1 SQLite database".
