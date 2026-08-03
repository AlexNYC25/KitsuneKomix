import pino from "pino";
import { join } from "node:path"
import { mkdir } from "node:fs/promises";

import { env } from "../config/env.ts"

const configLocation: string = env.CONFIG_DIRECTORY;
const logsDir: string = join(configLocation, "logs");

const workerLogFile: string = join(logsDir, "db.log")

await mkdir(logsDir, { recursive: true });
const workerFileExists: boolean = await Bun.file(workerLogFile).exists();

if (!workerFileExists) {
  await Bun.write(workerLogFile, "");
}

export const initWatcherWatcherLogger = async (): Promise<void> => {
  await mkdir(logsDir, {recursive: true})
}

export const workerLogger = pino({
  level: env.LOG_LEVEL,
}, pino.destination(workerLogFile));