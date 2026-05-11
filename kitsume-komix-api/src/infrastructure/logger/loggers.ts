import pino from "pino";
import { join } from "@std/path";

import { env } from "#config/env.ts";

const configLocation = env.APP_CONFIG_PATH;
const logsDir = join(configLocation, "logs");

// Ensure logs directory exists
try {
  Deno.mkdirSync(logsDir, { recursive: true });
} catch (_error) {
  // Directory might already exist, ignore error
}

const logLevel = env.LOG_LEVEL;

export const apiLogger = pino({
  level: logLevel,
}, pino.destination(join(logsDir, "api.log")));

export const dbLogger = pino({
  level: logLevel,
}, pino.destination(join(logsDir, "db.log")));

export const queueLogger = pino({
  level: logLevel,
}, pino.destination(join(logsDir, "queue.log")));

// Fallback simple loggers if pino-pretty fails
export const simpleApiLogger = pino({
  level: logLevel,
  timestamp: pino.stdTimeFunctions.isoTime,
});

export const simpleDbLogger = pino({
  level: logLevel,
  timestamp: pino.stdTimeFunctions.isoTime,
});
