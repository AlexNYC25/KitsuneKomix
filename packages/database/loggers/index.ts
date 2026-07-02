import pino from "pino";
import { join } from "node:path"
import { mkdir } from "node:fs/promises";

import { env } from "../config/env.ts";

const configLocation = env.CONFIG_DIRECTORY;
const logsDir = join(configLocation, "logs");

const dbLogFile = join(logsDir, "db.log")
const queueLogFile = join(logsDir, "queue.log")

await mkdir(logsDir, { recursive: true });
const dbFileExists: boolean = await Bun.file(dbLogFile).exists();
const queueFileExists: boolean = await Bun.file(queueLogFile).exists();

if (!dbFileExists) {
  await Bun.write(dbLogFile, "");
}

if (!queueFileExists) {
  await Bun.write(queueLogFile, "")
}

export const initDbLogger = async (): Promise<void> => {
  await mkdir(logsDir, { recursive: true });
};

export const dbLogger = pino({
  level: env.LOG_LEVEL,
}, pino.destination(dbLogFile));

export const queueLogger = pino({
  level: env.LOG_LEVEL,
}, pino.destination(queueLogFile))
