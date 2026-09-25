import { createLogger } from "./createLogger.ts";
import { logPaths } from "../paths.ts";

export const watcherLogger = createLogger(logPaths.watcher);