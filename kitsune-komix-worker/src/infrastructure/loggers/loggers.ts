import pino from "pino";
import { join } from "@std/path";

import { env } from "#config/env.ts";

const configLocation = env.CONFIG_DIRECTORY;
const logsDir = join(configLocation, "logs");

const logLevel = env.LOG_LEVEL;

export const queueLogger = pino({
  level: logLevel,
}, pino.destination(join(logsDir, "queue.log")));

export const workerLogger = pino({
  level: logLevel,
}, pino.destination(join(logsDir, "worker.log")));

export const initLogger = async (): Promise<void> => {
  await Deno.mkdir(logsDir, { recursive: true });
};