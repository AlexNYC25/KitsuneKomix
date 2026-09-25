import { mkdir } from "node:fs/promises";

import { logPaths } from "./paths.ts";

const logFiles: string[] = [
  logPaths.api,
  logPaths.db,
  logPaths.queue,
  logPaths.watcher,
  logPaths.worker,
];

export const initLogFiles = async (): Promise<void> => {
  await mkdir(logPaths.dir, { recursive: true });

  for (const file of logFiles) {
    if (!(await Bun.file(file).exists())) {
      await Bun.write(file, "");
    }
  }
};

await initLogFiles();