import pino from "pino";
import { join } from "@std/path";

import { env } from "#config/env.ts";

const configLocation = env.APP_CONFIG_PATH;
const logsDir = join(configLocation, "logs");

const logLevel = env.LOG_LEVEL;

export const initLogger = async (): Promise<void> => {
  await Deno.mkdir(logsDir, { recursive: true });
};

export const apiLogger = pino({
  level: logLevel,
}, pino.destination(join(logsDir, "api.log")));

export const dbLogger = pino({
  level: logLevel,
}, pino.destination(join(logsDir, "db.log")));

export const queueLogger = pino({
  level: logLevel,
}, pino.destination(join(logsDir, "queue.log")));

