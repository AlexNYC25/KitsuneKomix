# KitsuneKomix API -- Codebase Improvement Plan

> Generated: May 2026
> Scope: `kitsume-komix-api/`
> Stack: Deno, Hono, Drizzle ORM, SQLite, Redis, BullMQ

---

## Priority 1: Critical (Fix Immediately)

### 1.1 Remove Default JWT Secrets

**Problem:** `src/config/env.schema.ts` lines 13-14:
```ts
JWT_SECRET: z.string().default("supersecretkey"),
JWT_REFRESH_SECRET: z.string().default("supersecretkey_refresh"),
```

**Impact:** If these env vars are not set in production, the API uses publicly known defaults, making all JWT tokens trivially forgeable.

**Fix:** Remove defaults. Require them unconditionally, or at minimum throw when `MODE === "production"` and they match the default values:
```ts
JWT_SECRET: z.string().refine((val) => {
  if (env.MODE === "production" && val === "supersecretkey") {
    throw new Error("JWT_SECRET must be set in production");
  }
  return true;
}),
```

---

### 1.2 Split God File: `comicbooks.service.ts` (1,365 lines)

**Problem:** This single file handles:
- Fetching comics with metadata
- Metadata CRUD for 14+ entity types (writers, pencillers, inkers, colorists, letterers, editors, publishers, translators, etc.)
- Streaming/extraction/caching of comic pages
- Read/unread tracking
- Thumbnail management
- Comic deletion
- Next/previous navigation
- Duplicate detection

**Fix:** Split into focused service files:
```
src/modules/comics/
├── comicBooks.service.ts       # Basic CRUD: list, get, delete
├── comicMetadata.service.ts    # Metadata operations (14 entity types)
├── comicStreaming.service.ts   # Page extraction, caching, streaming
├── comicReading.service.ts     # Read history, tracking
└── comicThumbnails.service.ts  # Thumbnail generation/management
```

---

### 1.3 Fix N+1 Query Pattern

**Problem:** `src/modules/comics/comicbooks.service.ts` lines 179-187:
```ts
const comicsWithRelatedMetadata = comicBooksPromises.map(async (comic) => {
  const metadata = await fetchAComicsAssociatedMetadataById(comic.id);
  return { ...comic, metadata };
});
```

For each comic, `fetchAComicsAssociatedMetadataById()` makes 14+ separate DB queries. For a page of 20 comics, this results in **280+ queries**.

**Fix:** Batch the metadata fetch. Use a single query with JOINs or `IN (...)` clauses to fetch all metadata for all comics on the page in one or a few queries, then map in memory.

---

### 1.4 Add Missing Environment Variables to Schema

**Problem:** The following env vars are used in code but not defined/validated in `src/config/env.schema.ts`:

| Variable | Used In |
|----------|---------|
| `REDIS_HOST` | `src/infrastructure/db/redis/client.ts` |
| `REDIS_PORT` | `src/infrastructure/db/redis/client.ts` |
| `COMICS_DIRECTORY` | `src/modules/files/files.service.ts` |

**Impact:** These silently fall back to hardcoded defaults or `undefined`, causing runtime errors that are hard to debug.

**Fix:** Add them to `env.schema.ts` with proper types and defaults.

---

### 1.5 Remove/Protect Destructive Admin Endpoint

**Problem:** `src/infrastructure/db/sqlite/models/admin.model.ts` contains `purgeAllData()` marked as "Purely for testing purposes. NOTE: REALLY DESTRUCTIVE." Yet it is exposed via `/api/admin/purge-data` in production with no environment guard.

**Fix:** Either:
- Remove the endpoint entirely and the route registration
- Guard it behind `if (env.MODE !== "production")` so it can only run in development

---

## Priority 2: High (Do Next Sprint)

### 2.1 Eliminate Auth Check Duplication in Route Handlers

**Problem:** This 6-line block is repeated **50+ times** across all route files:
```ts
const user: AccessRefreshTokenCombinedPayload | undefined = c.get("user");
if (!user || !user.sub) {
  return c.json({ message: "Unauthorized" }, 401);
}
const userId: number = parseInt(user.sub, 10);
if (isNaN(userId)) {
  return c.json({ message: "Invalid user ID" }, 400);
}
```

**Fix:** Create a middleware that extracts and validates the user ID, then sets it on context:
```ts
export const withUserId = createMiddleware(async (c, next) => {
  const user = c.get("user");
  if (!user?.sub) return c.json({ message: "Unauthorized" }, 401);
  const userId = parseInt(user.sub, 10);
  if (isNaN(userId)) return c.json({ message: "Invalid user ID" }, 400);
  c.set("userId", userId);
  await next();
});
```

Then handlers just do: `const userId = c.get("userId");`

---

### 2.2 Fix `requireAdmin` Middleware Inconsistency

**Problem:** The `requireAdmin` middleware in `src/modules/auth/middleware/authChecks.ts` (line 91) checks:
```ts
if (!user.roles.includes("admin")) return c.json({ message: "Forbidden" }, 403);
```

But the JWT verification in `src/modules/auth/jwt.service.ts` (line 52) adds `isAdmin` as a boolean property, not a `roles` array. These are incompatible. Additionally, `requireAdmin` is **never used** in any route -- all routes manually check `user.isAdmin`.

**Fix:** Pick one approach. Either:
- Add `roles: string[]` to the JWT payload and use `requireAdmin`
- Fix `requireAdmin` to check `user.isAdmin === true` and apply it to all admin routes

---

### 2.3 Standardize Import Paths

**Problem:** Multiple import path inconsistencies:

| File | Issue |
|------|-------|
| `src/app/api.ts` lines 7-9 | Uses relative imports (`../routes/...`) instead of `#routes/` alias |
| `src/infrastructure/db/scripts/migrate.ts` line 4 | Uses relative imports instead of `#logger/` and `#db/` aliases |
| `tests/comic-series/comicSeries.test.ts` line 8 | Uses `#sqlite/` alias which is **not defined** in `deno.json` |
| Workers | Use `#db/redis/client.ts` while other files use `#infrastructure/db/redis/client.ts` |

**Fix:**
- Enforce `#` aliases for all cross-directory imports
- Add missing `#sqlite/` alias to `deno.json` or fix the test import
- Standardize on one alias pattern for redis client

---

### 2.4 Replace All `console.error` with Pino Loggers

**Problem:** Route handlers and service layer use `console.error()` extensively while infrastructure uses pino loggers (`apiLogger`, `dbLogger`, `queueLogger`).

**Examples:**
- `src/routes/comics/api.comicbooks.router.ts` line 204
- `src/modules/users/users.service.ts` line 34

**Fix:** Replace all `console.error` calls with the appropriate logger. Create a convention:
- Route handlers -> `apiLogger`
- Service layer -> `apiLogger` or a dedicated `serviceLogger`
- DB operations -> `dbLogger`
- Queue/worker operations -> `queueLogger`

---

### 2.5 Centralize Database Path Configuration

**Problem:** The SQLite database path is defined in two places:
- `drizzle.config.ts` line 5: `join(process.cwd(), "config", "database.sqlite")`
- `src/infrastructure/db/sqlite/client.ts` line 5: `join(Deno.cwd(), "config", "database.sqlite")`

**Fix:** Define it once in `env.ts` and import it everywhere:
```ts
// env.ts
export const DB_PATH = join(Deno.cwd(), "config", "database.sqlite");
```

---

### 2.6 Separate Worker Entry Point

**Problem:** `main.ts` imports workers as side-effects:
```ts
import "#infrastructure/queue/workers/comicBook.worker.ts";
import "#infrastructure/queue/workers/series.worker.ts";
import "#infrastructure/queue/workers/file.worker.ts";
```

Per the AGENTS.md guide, workers "run via a separate worker service." Running them in the same process as the API defeats the purpose of having a separate worker service in `docker-compose.yml`.

**Fix:** Create a separate entry point `worker.ts`:
```
main.ts     -> API process only (no worker imports)
worker.ts   -> Worker process only (imports workers, no Deno.serve)
```

Update `docker-compose.yml` to run the appropriate entry point for each service.

---

### 2.7 Add Missing Env Vars to Redis Client

**Problem:** `src/infrastructure/db/redis/client.ts` reads env vars directly:
```ts
host: Deno.env.get("REDIS_HOST") ?? "redis",
port: Number(Deno.env.get("REDIS_PORT") ?? 6379),
```

This bypasses the Zod-validated `env` schema.

**Fix:** Add `REDIS_HOST` and `REDIS_PORT` to `env.schema.ts`, then use `env.REDIS_HOST` / `env.REDIS_PORT` in the redis client.

---

## Priority 3: Medium (Improve Developer Experience)

### 3.1 Fix Function Name Typos

| Location | Current | Correct |
|----------|---------|---------|
| `src/modules/comics/comicbooks.service.ts:1342` | `attatchMetadataToComicBook` | `attachMetadataToComicBook` |
| `src/modules/series/comicSeries.service.ts:167` | `complileTheCompleteComicSeriesCreditsMetadata` | `compileTheCompleteComicSeriesCreditsMetadata` |

---

### 3.2 Fix Hardcoded Cache and Threshold Values

**Problem:** `src/modules/comics/comicbooks.service.ts`:
```ts
// Line 573-574
const cacheDir = "./cache/pages";
const comicCacheDir = `${cacheDir}/${data.comicId}`;

// Line 1129
const thumbnailDir = '/app/cache/thumbnails/custom';

// Line 593
const isLargeFile = fileSize > 100 * 1024 * 1024; // 100MB hardcoded
```

**Fix:** Move to `env.ts`:
```ts
CACHE_PAGES_DIR: z.string().default("./cache/pages"),
CACHE_THUMBNAILS_DIR: z.string().default("./cache/thumbnails/custom"),
LARGE_FILE_THRESHOLD_BYTES: z.coerce.number().default(104857600), // 100MB
```

---

### 3.3 Fix Hardcoded Log Level

**Problem:** `src/infrastructure/logger/loggers.ts` hardcodes `level: "debug"` for all loggers (lines 17, 21, 25).

**Fix:** Add `LOG_LEVEL` to `env.schema.ts` and use it:
```ts
level: env.LOG_LEVEL ?? "info",
```

---

### 3.4 Remove Unused Code

| File/Export | Reason |
|-------------|--------|
| `src/infrastructure/logger/loggers.ts` -- `simpleApiLogger`, `simpleDbLogger` | Never imported anywhere |
| `src/modules/auth/middleware/authChecks.ts` -- `requireCookieAuth` | Never used; all routes use Bearer token auth |
| `src/modules/auth/middleware/authChecks.ts` -- `requireTokenAuth` | Alias for `requireAuth`, never used directly |
| `src/modules/auth/middleware/authChecks.ts` -- `requireValidRefreshToken` | Defined but never used |
| `src/config/queues.ts` -- `fileOrchestrationQueue` | Defined but never used |
| `src/shared/zod/response.schema.ts` -- `FilterMetaSchema`, `SortMetaSchema` | Defined but never exported |
| `src/app/queues.ts` repetitive pattern (lines 14-94) | Same 4-line pattern repeated 5 times; extract to factory |

---

### 3.5 Standardize Service File Naming

**Problem:** Inconsistent naming across `src/modules/`:

| Current | Convention Used |
|---------|-----------------|
| `users.service.ts` | plural, dot-separated |
| `comicbooks.service.ts` | plural, no separator |
| `comicSeries.service.ts` | camelCase |
| `comicLibraries.service.ts` | camelCase |
| `comicStoryArcs.service.ts` | camelCase |
| `files.service.ts` | plural, dot-separated |

**Fix:** Pick one convention. Recommended: kebab-case filenames with `.service.ts` suffix:
```
users.service.ts
comic-books.service.ts
comic-series.service.ts
comic-libraries.service.ts
comic-story-arcs.service.ts
files.service.ts
```

Update import map aliases accordingly.

---

### 3.6 Fix DB Client Reconnection Logic

**Problem:** `src/infrastructure/db/sqlite/client.ts` uses a lazy singleton with no reconnection:
```ts
let client: ReturnType<typeof createClient> | null = null;
let db: ReturnType<typeof drizzle> | null = null;
export const getClient = () => {
  if (!client) { client = createClient(...); db = drizzle(client, ...); }
  return { client, db };
};
```

If the SQLite connection drops or becomes corrupt, the client will never reconnect.

**Fix:** Add a `reconnect()` method or health check that reinitializes the client on failure.

---

### 3.7 Add Error Correlation/Request IDs

**Problem:** The global error handler in `src/app/api.ts` (lines 38-41) logs errors but has no request ID for correlation:
```ts
app.onError((err, c) => {
  apiLogger.error("Unhandled error: " + err.message);
  return c.json({ error: "Internal Server Error" }, 500);
});
```

**Fix:** Add a middleware that generates a request ID (UUID) at the start of each request, attaches it to the context, and includes it in all log entries and error responses.

---

### 3.8 Remove Error Message Leaking

**Problem:** `src/routes/auth/api.auth.router.ts` line 383:
```ts
return c.json({
  message: `Failed to check setup status: ${error instanceof Error ? error.message : String(error)}`,
}, 500);
```

Internal error details are exposed to the client.

**Fix:** Log the full error server-side, return a generic message to the client:
```ts
apiLogger.error("Setup status check failed", error);
return c.json({ message: "Failed to check setup status" }, 500);
```

---

### 3.9 Standardize Zod Import Sources

**Problem:** Some files import `z` from `zod`, others from `@hono/zod-openapi`:
```ts
// env.schema.ts
import { z } from 'zod';

// request.schema.ts
import { z } from "@hono/zod-openapi";
```

**Fix:** Standardize on one source. Since the project uses Hono's OpenAPI integration, prefer `@hono/zod-openapi` for route-related schemas and `zod` directly for env/config schemas. Document this convention.

---

### 3.10 Fix Zod v4 `z.email()` Typo Usage

**Problem:** `src/shared/zod/schemas/request.schema.ts` line 268 uses `z.email()` which is a Zod v4 feature. This works with the current version (`zod@^4.1.11`), but mixing it with `z.string().email()` style elsewhere is inconsistent.

**Fix:** Standardize on either `z.email()` (v4 shorthand) or `z.string().email()` across all schemas.

---

### 3.11 Fix `as unknown as` Type Casts in Workers

**Problem:** `src/infrastructure/queue/workers/comicBook.worker.ts` lines 18-23:
```ts
case "save-comic-book":
  return await saveComicBook(job.data as unknown as { filePath: string; seriesId: number });
```

**Impact:** Indicates missing or incorrect job data type definitions. Type casts hide real type errors.

**Fix:** Define proper TypeScript interfaces for each job type and use them:
```ts
interface SaveComicBookJob {
  filePath: string;
  seriesId: number;
}
// Then: job.data as SaveComicBookJob
```

---

## Priority 4: Low (Nice-to-Have)

### 4.1 Expand Test Coverage

**Current state:** Only 2 test files with 3 tests total:
- `tests/comic-series/comicSeries.test.ts` -- 1 test
- `tests/utilities/metadata.test.ts` -- 2 tests

**Missing:** Route handlers, auth middleware, service layer, queue workers, utilities.

**Fix:** Prioritize tests for:
1. Auth flows (login, token refresh, admin checks)
2. Comic book CRUD operations
3. Metadata extraction pipeline
4. File watcher behavior

Also fix `#sqlite/` import alias issue that would cause tests to fail.

---

### 4.2 Make Logger Initialization Async

**Problem:** `src/infrastructure/logger/loggers.ts` line 11:
```ts
Deno.mkdirSync(logsDir, { recursive: true });
```

This runs synchronously at module load time and could block startup.

**Fix:** Use `await Deno.mkdir(logsDir, { recursive: true })` in an async initialization function.

---

### 4.3 Add Barrel Exports to Module Directories

**Problem:** No `index.ts` barrel exports exist in any module directory. Every import uses the full path:
```ts
import { fetchComicBooks } from "#modules/comics/comicbooks.service.ts";
```

**Fix:** Add `index.ts` to each module directory:
```ts
// src/modules/comics/index.ts
export * from "./comicBooks.service.ts";
export * from "./comicMetadata.service.ts"; // after split
```

---

### 4.4 Consolidate `#types/` and `#interfaces/`

**Problem:** Both directories exist with overlapping purposes. `#interfaces/` has only 4 files and is minimally used. Most code uses `#types/index.ts`.

**Fix:** Merge `#interfaces/` into `#types/` and remove the `#interfaces/` import map entry.

---

### 4.5 Add Database Seeding for Tests

**Problem:** Tests directly interact with the database but have no migration/seed setup. The cleanup only deletes the test series but does not clean up metadata cache or other side effects.

**Fix:** Create a test setup/teardown utility that:
1. Runs migrations on a test database
2. Seeds required baseline data
3. Wraps each test in a transaction that rolls back

---

### 4.6 Improve Global Error Handler

**Problem:** `src/app/api.ts` error handler doesn't differentiate between error types and doesn't log stack traces.

**Fix:**
```ts
app.onError((err, c) => {
  const requestId = c.get("requestId") ?? "unknown";
  if (err instanceof HTTPException) {
    apiLogger.warn({ requestId, status: err.status }, err.message);
    return c.json({ error: err.message }, err.status);
  }
  apiLogger.error({ requestId, stack: err.stack }, "Unhandled error");
  return c.json({ error: "Internal Server Error", requestId }, 500);
});
```

---

## Quick Wins Checklist

- [ ] Rename `attatchMetadataToComicBook` -> `attachMetadataToComicBook`
- [ ] Rename `complileTheComplete...` -> `compileTheComplete...`
- [ ] Remove `simpleApiLogger` and `simpleDbLogger` exports
- [ ] Remove `requireCookieAuth`, `requireTokenAuth`, `requireValidRefreshToken` unused middlewares
- [ ] Remove unused `fileOrchestrationQueue` from queues config
- [ ] Remove unused `FilterMetaSchema` and `SortMetaSchema`
- [ ] Fix `#sqlite/` import in test file
- [ ] Replace relative imports in `src/app/api.ts` with `#routes/` aliases
- [ ] Replace relative imports in `src/infrastructure/db/scripts/migrate.ts` with aliases
- [ ] Guard or remove `purgeAllData` admin endpoint

## Effort Estimate

| Priority | Items | Estimated Effort |
|----------|-------|------------------|
| Critical | 5 items | 3-5 days |
| High | 7 items | 1-2 weeks |
| Medium | 11 items | 1-2 weeks |
| Low | 6 items | 3-5 days |

**Total estimated effort:** 4-7 weeks for a single developer
