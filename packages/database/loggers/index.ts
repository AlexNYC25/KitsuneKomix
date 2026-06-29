import pino from "pino";
import { join } from "node:path"
import { mkdir } from "node:fs/promises";

import { env } from "../config/env.ts";

const configLocation = env.CONFIG_DIRECTORY;
const logsDir = join(configLocation, "logs");
const dbLogFile = join(logsDir, "db.log")

await mkdir(logsDir, { recursive: true });
const fileExists: boolean = await Bun.file(dbLogFile).exists();

if (!fileExists) {
  await Bun.write(dbLogFile, "");
}

export const initDbLogger = async (): Promise<void> => {
  await mkdir(logsDir, { recursive: true });
};

export const dbLogger = pino({
  level: env.LOG_LEVEL,
}, pino.destination(dbLogFile));
