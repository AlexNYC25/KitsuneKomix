import { createLogger } from "./createLogger.ts";
import { logPaths } from "../paths.ts";

export const workerLogger = createLogger(logPaths.worker);