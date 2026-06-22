# PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-10
**Stack:** Deno/Hono/SQLite (API) + Vue3/Vite/Pinia (Client) + BullMQ/Redis (Workers)

## STRUCTURE
```
./
├── packages/database/          # Shared DB layer — models, schemas, migrations, types
├── kitsune-komix-api/          # Deno backend — Hono REST API, imports DB via #database/
├── kitsune-komix-client/       # Vue 3 frontend — Pinia stores, Vite build, Vitest tests
├── docker-compose.yml          # Orchestrates Redis + API + Worker + Client
└── AGENTS.md                   # ← You are here
```

## WHERE TO LOOK

| Task | Go To | Notes |
|------|-------|-------|
| API entry | `kitsune-komix-api/main.ts` | Hono app bootstrap, middleware, routes |
| Worker entry | `kitsune-komix-api/worker.ts` | SQLite-based background processor (will move to own service) |
| API routes | `kitsune-komix-api/src/routes/*/` | 13 route modules (comics, auth, users, etc.) |
| Business logic | `kitsune-komix-api/src/modules/*/` | 7 service modules |
| DB models | `packages/database/src/models/` | 33 Drizzle model files (shared with worker) |
| DB schemas | `packages/database/src/schemas/` | Table definitions + mappings (shared with worker) |
| DB types | `packages/database/src/types/` | Database domain types (no Zod dependency) |
| DB migrations | `packages/database/src/drizzle/` | Drizzle Kit migration SQL files |
| DB client | `packages/database/src/client.ts` | SQLite connection singleton (libsql + Drizzle) |
| DB scripts | `packages/database/src/scripts/` | migrate, seed, dbml |
| DB config | `packages/database/src/config/` | Minimal env schema (DB_PATH, LOG_LEVEL, PAGE_SIZE) |
| Client entry | `kitsune-komix-client/src/main.ts` | Vue app init (Pinia, Router, PrimeVue) |
| Vue components | `kitsune-komix-client/src/components/` | 12+ components (reader, nav, forms) |
| Pinia stores | `kitsune-komix-client/src/stores/` | 6 stores (auth, comics, libraries, etc.) |
| Pages/routes | `kitsune-komix-client/src/pages/` | 5 page components |
| Client utilities | `kitsune-komix-client/src/utilities/` | 7 helpers (apiClient, formatting, etc.) |
| Shared types | `kitsune-komix-api/src/shared/types/` | 18 type definitions |
| Zod schemas | `kitsune-komix-api/src/shared/zod/` | API request validation + OpenAPI docs |

## CONVENTIONS

- **API:** Deno runtime (not Node). Uses `deno.json` for imports/tasks. Avoid Node APIs (`node:path`) — Deno has its own std lib.
- **Client:** Vue 3 Composition API + `<script setup>`. TypeScript everywhere. Pinia for state.
- **Zod → OpenAPI:** All API schemas defined via Zod; auto-exposed at `/api/doc` for client type generation.
- **Routes:** Organised by domain in `src/routes/<domain>/api.<domain>.router.ts`. Pattern: one route file per domain.
- **Modules:** Business logic in `src/modules/<domain>/<domain>.service.ts`. Thin routers delegate to services.
- **DB:** Drizzle ORM with SQLite. Shared in `packages/database/`. Both API and worker import via `#database/` import map alias.
- **Tests:** Client uses Vitest (`pnpm test:unit`). API tests in `kitsune-komix-api/tests/`. No CI pipeline yet.

## ANTI-PATTERNS (THIS PROJECT)
- **Node API imports in Deno code** — files.service.ts uses `node:path`. Use Deno's `@std/path` instead.
- **Stub routes** — Several route files (collections, pages) have 404 stubs for unimplemented endpoints. Don't add more without real implementation.
- **Deprecated functions (client)** — `csvDownload`, `filterBy`, `publish` in utilities are marked deprecated. Prefer current alternatives.
- **Missing JWT secret defaults** — `env.schema.ts` has no default for `JWT_SECRET`. Always set it in `.env`.
- **No CI/CD** — No GitHub Actions workflows. Build/test is entirely manual via Docker Compose.
- **Worker in progress** — `worker.ts` still lives in the API package. It needs to be extracted to a standalone `kitsune-komix-worker/` service once it has real processing logic.

## UNIQUE STYLES

- **Shared database package:** `packages/database/` is a standalone Deno package used by both the API and worker services via `#database/` import map alias.
- **Dual entry points (API):** Separate `main.ts` (API server) and `worker.ts` (background SQLite-based processor) — same codebase, different roles.
- **Dynamic OpenAPI type generation (Client):** Dev server polls `/api/doc` for up to 30s on startup, generating `openapi-schema.ts` with typed API client.
- **Docker Compose dev workflow:** 3 services (API, Worker, Client) start together. Hot-reload for both API (Deno) and Client (Vite HMR). No Redis/BullMQ anymore.

## COMMANDS
```bash
# Full stack (development)
docker-compose up --build

# Client only
cd kitsune-komix-client && pnpm dev      # Dev server on :5173
cd kitsune-komix-client && pnpm lint      # ESLint
cd kitsune-komix-client && pnpm format    # Prettier
cd kitsune-komix-client && pnpm test:unit # Vitest

# API only
cd kitsune-komix-api && deno task start   # Dev on :8001
```

## NOTES / GOTCHAS

- **Client type gen blocks dev:** `pnpm dev` blocks for 30s waiting for API to respond at `localhost:8001/api/doc`. Start API first.
- **Dual config roots:** API uses `deno.json`. Client uses `package.json` + `tsconfig*.json` + `vite.config.ts` — different toolchains under one roof.
- **No production Docker Compose:** Current compose targets dev mode with hot-reload. Prod needs separate build configs.
- **Shared database types:** `packages/database/src/types/` has the DB-domain types. API's `src/shared/types/` re-exports from there and adds Zod-inferred types.
- **Docker volume for packages:** In Docker Compose, `./packages:/app/packages` is mounted so the `#database/` import map resolves inside the container.
- **No Redis / BullMQ:** The old queue/infrastructure layer has been removed. The project now uses SQLite-based background processing.
- **Import map:** Use `#database/` → `../packages/database/src/` in both `kitsune-komix-api/deno.json` and future `kitsune-komix-worker/deno.json`.
