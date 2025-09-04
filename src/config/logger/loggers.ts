import pino from "pino";
import { join } from "@std/path";

const configLocation = "/app/config";
const logsDir = join(configLocation, "logs");

// Ensure logs directory exists
try {
  Deno.mkdirSync(logsDir, { recursive: true });
} catch (_error) {
  // Directory might already exist, ignore error
}

export const apiLogger = pino({
  level: "debug",
  transport: {
    target: "pino-pretty",
    options: {
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
      destination: join(logsDir, "api.log"),
    },
  },
});

export const dbLogger = pino({
  level: "debug",
  transport: {
    target: "pino-pretty",
    options: {
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
      destination: join(logsDir, "db.log"),
    },
  },
});

export const queueLogger = pino({
  level: "debug",
  transport: {
    target: "pino-pretty",
    options: {
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
      destination: join(logsDir, "queue.log"),
    },
  },
});

// Fallback simple loggers if pino-pretty fails
export const simpleApiLogger = pino({
  level: "debug",
  timestamp: pino.stdTimeFunctions.isoTime,
});

export const simpleDbLogger = pino({
  level: "debug",
  timestamp: pino.stdTimeFunctions.isoTime,
});
