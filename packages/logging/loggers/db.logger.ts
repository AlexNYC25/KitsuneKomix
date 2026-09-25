import { createLogger } from "./createLogger.ts";
import { logPaths } from "../paths.ts";

export const dbLogger = createLogger(logPaths.db);