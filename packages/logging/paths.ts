import { join } from "node:path";

import { env } from "kitsune-komix-config";

const logsDir: string = join(env.CONFIG_DIRECTORY, "logs");

export const logPaths = {
  dir: logsDir,
  api: join(logsDir, "api.log"),
  db: join(logsDir, "db.log"),
  queue: join(logsDir, "queue.log"),
  watcher: join(logsDir, "watcher.log"),
  worker: join(logsDir, "worker.log"),
} as const;