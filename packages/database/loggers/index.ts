import pino from "pino";
import { join } from "@std/path";

import { env } from "../config/env.ts";

const configLocation = env.CONFIG_DIRECTORY;
const logsDir = join(configLocation, "logs");
const dbLogFile = join(logsDir, "db.log")

await Deno.mkdir(logsDir, { recursive: true });
const file = await Deno.open(dbLogFile, { create: true, write: true });
file.close();

export const initDbLogger = async (): Promise<void> => {
  await Deno.mkdir(logsDir, { recursive: true });
};

export const dbLogger = pino({
  level: env.LOG_LEVEL,
}, pino.destination(dbLogFile));
