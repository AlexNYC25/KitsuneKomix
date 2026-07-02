import { open } from "@russellthehippo/honker-bun";

import { env } from "../config/env.ts"
import { generateSqlFilePath } from "../utilities/db-file.ts"

const queue: ReturnType<typeof open> | null = null

export const getQueueClient = async () => {
  if(!queue) {
    const sqlitePath: string = await generateSqlFilePath(env.CONFIG_DIRECTORY);

    const db = open(sqlitePath, "/honker/libhonker_ext.so")
  }
}