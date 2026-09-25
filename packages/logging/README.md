# kitsune-komix-logging

Shared pino-based logging for the Kitsune Komix services.

## Structure

- `paths.ts` — log directory + per-service log file path constants (pure, no side effects).
- `loggers/createLogger.ts` — `createLogger(destination)` factory wired to `env.LOG_LEVEL`.
- `loggers/*.logger.ts` — one logger per service/domain: `api`, `db`, `queue`, `watcher`, `worker`.
- `init.ts` — `initLogFiles()` ensures the logs directory and files exist (runs on import).

## Usage

```ts
import { apiLogger, dbLogger, workerLogger, logPaths, createLogger } from "kitsune-komix-logging";

apiLogger.info("hello");

const customLogger = createLogger(logPaths.worker);
customLogger.error("boom");
```

Importing any logger (or the package `mod.ts`) ensures the log files exist. `paths.ts` can be imported on its own without side effects.