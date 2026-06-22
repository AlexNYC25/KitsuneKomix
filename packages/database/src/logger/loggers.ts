import pino from "pino";
import { join } from "@std/path";

import { env } from "../config/env.ts";

const configLocation = env.APP_CONFIG_PATH;
const logsDir = join(configLocation, "logs");

export const initDbLogger = async (): Promise<void> => {
  await Deno.mkdir(logsDir, { recursive: true });
};

export const dbLogger = pino({
  level: env.LOG_LEVEL,
}, pino.destination(join(logsDir, "db.log")));
