import { open } from "@russellthehippo/honker-bun"

import { env } from "../config/env.ts"
import { queueLogger } from "../loggers/index.ts";
import { generateSqlFilePath } from "../utilities/db-file.ts"

export const getTempQueue = async () => {
  const sqlitePath: string = await generateSqlFilePath(env.CONFIG_DIRECTORY);
  const honkerPath: string = "/honker/libhonker_ext.so"

  const db = open(sqlitePath, honkerPath);

  const q = db.queue("temp");

  return q;
}