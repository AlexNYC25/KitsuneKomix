import pino from "pino";
import { join } from "node:path"
import { mkdir } from "node:fs/promises";

import { env } from "../config/env.ts"

const configLocation: string = env.CONFIG_DIRECTORY;
const logsDir: string = join(configLocation, "logs");

const dbLogFile: string = join(logsDir, "db.log")
const watcherLogFile: string = join(logsDir, "watcher.log")

await mkdir(logsDir, { recursive: true });
const dbFileExists: boolean = await Bun.file(dbLogFile).exists();
const watcherFileExists: boolean = await Bun.file(watcherLogFile).exists();

if (!dbFileExists) {
  await Bun.write(dbLogFile, "");
}

if (!watcherFileExists) {
  await Bun.write(watcherLogFile, "")
}

export const initWatcherDbLogger = async (): Promise<void> => {
  await mkdir(logsDir, {recursive: true})
}

export const watcherLogger = pino({
  level: env.LOG_LEVEL,
}, pino.destination(watcherLogFile))