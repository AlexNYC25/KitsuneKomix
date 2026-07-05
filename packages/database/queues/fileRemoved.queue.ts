import { open } from "@russellthehippo/honker-bun"

import { env } from "../config/env.ts"
import { QueueNames } from "../config/queues.ts"
import { generateSqlFilePath } from "../utilities/db-file.ts"

export const getFileRemovedQueue = async () => {
  const sqlitePath: string = await generateSqlFilePath(env.CONFIG_DIRECTORY);
  const honkerPath: string = env.HONKER_LIB_PATH

  const db = open(sqlitePath, honkerPath);

  const q = db.queue(QueueNames.FILE_REMOVED);

  return q;
}