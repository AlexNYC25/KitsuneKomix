import { open, type Database, type Queue } from "@russellthehippo/honker-bun"

import { env } from "../config/env.ts"
import { QueueNames } from "../config/queues.ts"
import { generateSqlFilePath } from "../utilities/db-file.ts"

export const getQueue = async (queueName: keyof typeof QueueNames) => {
  const sqlitePath: string = await generateSqlFilePath(env.CONFIG_DIRECTORY);
  const honkerPath: string = env.HONKER_LIB_PATH

  const db: Database = open(sqlitePath, honkerPath);
 
  const mappedQueueName = QueueNames[queueName]

  const q: Queue = db.queue(mappedQueueName);

  return q;
}