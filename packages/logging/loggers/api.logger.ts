import { createLogger } from "./createLogger.ts";
import { logPaths } from "../paths.ts";

export const apiLogger = createLogger(logPaths.api);