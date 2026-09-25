import pino from "pino";

import { env } from "kitsune-komix-config";

export const createLogger = (destination: string): pino.Logger =>
  pino({ level: env.LOG_LEVEL }, pino.destination(destination));