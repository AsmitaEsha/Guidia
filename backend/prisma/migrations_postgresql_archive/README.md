# Archived PostgreSQL migration

Guidia now uses SQLite by default (`../migrations/`), so it runs on any laptop
with no database server. This folder keeps the PostgreSQL baseline in case you
later host Guidia on PostgreSQL. To switch: set `provider = "postgresql"` in
`schema.prisma`, change the two `Json` list fields back to `String[]` if you
like, and generate a fresh migration with `prisma migrate dev`.
