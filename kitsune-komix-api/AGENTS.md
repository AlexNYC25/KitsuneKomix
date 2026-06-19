# KitsuneKomix API Agent Guide

> Deno + Hono + SQLite (Drizzle ORM) backend. 164 source files.

## OVERVIEW

RESTful API server with BullMQ background workers. Entry points: `main.ts` (HTTP server) and `worker.ts` (queue consumer).

## STRUCTURE

```
kitsune-komix-api/src/
├── app/           # App init: api.ts, watcher.ts, queues.ts
├── config/        # env.ts, appMeta.ts, queues.ts
├── infrastructure/  # DB (SQLite/Drizzle), logger, queue (BullMQ)
├── modules/       # Business logic (7 domains)
├── routes/        # HTTP route handlers (13 groups)
└── shared/        # Types (18), interfaces, utilities, Zod schemas
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Module logic | `src/modules/comics/` | 6 service files: metadata, reading, streaming, thumbnails |
| Route handlers | `src/routes/api/api.router.ts` | Main API router, mounts all sub-routers |
| DB schema defs | `src/infrastructure/db/sqlite/schemas/tables/` | Drizzle table definitions |
| DB models | `src/infrastructure/db/sqlite/models/` | 30 data access models |
| Queue jobs | `src/infrastructure/queue/jobs/` | BullMQ job definitions (3 files) |
| Queue workers | `src/infrastructure/queue/workers/` | Background processors (3 workers) |
| Auth | `src/modules/auth/` | JWT + middleware |
| Types | `src/shared/types/` | 18 domain type files |
| Zod schemas | `src/shared/zod/schemas/data/` | Validation + OpenAPI |
| Tests | `tests/` | API + queue + integration tests |

## CONVENTIONS

- **Module pattern**: Each domain = one service file in `src/modules/` (comics is exception — 6 files)
- **Route pattern**: One router file per domain in `src/routes/`, mounted via `api.router.ts`
- **DB access**: Drizzle ORM models encapsulate SQL queries
- **Validation**: Zod schemas in `shared/zod/schemas/` — auto-exposed as OpenAPI
- **Queue pattern**: Job defs in `jobs/`, processors in `workers/`, event callbacks in `callbacks.ts`
- **Auth middleware**: JWT-based, in `modules/auth/middleware/`

## ANTI-PATTERNS

- **Business logic in routes**: `routes/comics/api.comicbooks.router.ts` has inline service logic — migrate to modules when touching
- **Incomplete endpoints**: Collections router has many 501 stubs
- **Deprecated**: `comicPages` model field `path` → use `relativePath` + `fileSystemPath`
- **Deprecated**: `comicSeries.totalsForSeries()` — use alternatives
- **No linting config**: API lacks ESLint/Prettier — relies on `deno lint` and `deno fmt`

## COMMANDS

```bash
deno task start   # Start server
deno test         # Run tests
deno lint         # Lint
deno fmt          # Format
```
