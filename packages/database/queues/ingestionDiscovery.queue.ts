import { open, type Database, type Queue } from "@russellthehippo/honker-bun"

import { env } from "../config/env.ts"
import { QueueNames } from "../config/queues.ts"
import { generateSqlFilePath } from "../utilities/db-file.ts"

export const getIngestionDiscoveryQueue = async () => {
  const sqlitePath: string = await generateSqlFilePath(env.CONFIG_DIRECTORY);
  const honkerPath: string = env.HONKER_LIB_PATH

  const db: Database = open(sqlitePath, honkerPath);

  const q: Queue = db.queue(QueueNames.INGESTION_DISCOVERY);

  return q;
}