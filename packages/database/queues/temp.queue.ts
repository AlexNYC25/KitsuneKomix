import { open, type Database, type Queue } from "@russellthehippo/honker-bun"

import { env } from "../config/env.ts"
import { QueueNames } from "../config/queues.ts"
import { generateSqlFilePath } from "../utilities/db-file.ts"

export const getTempQueue = async () => {
  const sqlitePath: string = await generateSqlFilePath(env.CONFIG_DIRECTORY);
  const honkerPath: string = "/honker/libhonker_ext.so"

  const db: Database = open(sqlitePath, honkerPath);

  const q: Queue = db.queue(QueueNames.TEMP);

  return q;
}