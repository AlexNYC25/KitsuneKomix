# PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-10
**Stack:** Deno/Hono/SQLite (API) + Vue3/Vite/Pinia (Client) + BullMQ/Redis (Workers)

## STRUCTURE
```
./
├── kitsune-komix-api/          # Deno backend — Hono REST API, SQLite (Drizzle ORM), BullMQ queue
├── kitsune-komix-client/       # Vue 3 frontend — Pinia stores, Vite build, Vitest tests
├── docker-compose.yml          # Orchestrates Redis + API + Worker + Client
└── AGENTS.md                   # ← You are here
```

## WHERE TO LOOK

| Task | Go To | Notes |
|------|-------|-------|
| API entry | `kitsune-komix-api/main.ts` | Hono app bootstrap, middleware, routes |
| Worker entry | `kitsune-komix-api/worker.ts` | BullMQ background processor |
| API routes | `kitsune-komix-api/src/routes/*/` | 13 route modules (comics, auth, users, etc.) |
| Business logic | `kitsune-komix-api/src/modules/*/` | 7 service modules |
| DB models | `kitsune-komix-api/src/infrastructure/db/sqlite/models/` | 30 Drizzle model files |
| DB schemas | `kitsune-komix-api/src/infrastructure/db/sqlite/schemas/` | Table definitions + mappings |
| Queue jobs | `kitsune-komix-api/src/infrastructure/queue/jobs/` | BullMQ job definitions |
| Queue workers | `kitsune-komix-api/src/infrastructure/queue/workers/` | BullMQ worker processors |
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
- **DB:** Drizzle ORM with SQLite. Models in `src/infrastructure/db/sqlite/models/`. Schema migrations in `drizzle/`.
- **Tests:** Client uses Vitest (`pnpm test:unit`). API tests in `kitsune-komix-api/tests/`. No CI pipeline yet.

## ANTI-PATTERNS (THIS PROJECT)
- **Node API imports in Deno code** — files.service.ts uses `node:path`. Use Deno's `@std/path` instead.
- **Stub routes** — Several route files (collections, pages) have 404 stubs for unimplemented endpoints. Don't add more without real implementation.
- **Deprecated functions (client)** — `csvDownload`, `filterBy`, `publish` in utilities are marked deprecated. Prefer current alternatives.
- **Missing JWT secret defaults** — `env.schema.ts` has no default for `JWT_SECRET`. Always set it in `.env`.
- **No CI/CD** — No GitHub Actions workflows. Build/test is entirely manual via Docker Compose.

## UNIQUE STYLES

- **Dual entry points (API):** Separate `main.ts` (API server) and `worker.ts` (background queue processor) — same codebase, different roles.
- **Dynamic OpenAPI type generation (Client):** Dev server polls `/api/doc` for up to 30s on startup, generating `openapi-schema.ts` with typed API client.
- **Docker Compose dev workflow:** All 4 services (Redis, API, Worker, Client) start together. Hot-reload for both API (Deno) and Client (Vite HMR).

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
- **Large types dir:** `src/shared/types` has 18 files — these are shared across routes, modules, and the worker. Central source of truth.
- **Workers are Deno processes, not Node:** Don't use npm packages in worker code. Same rules as API.
