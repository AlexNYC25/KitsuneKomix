import { createLogger } from "./createLogger.ts";
import { logPaths } from "../paths.ts";

export const queueLogger = createLogger(logPaths.queue);