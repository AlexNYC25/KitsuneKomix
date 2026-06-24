import { assertEquals } from "@std/assert"

import { env } from "../config/env.ts"
import { assert } from "node:console";

Deno.test("API can access app directories", async () => {
  
  const comicsDirectoryReadStatus = await Deno.permissions.query({name: "read", path: env.COMICS_DIRECTORY});
  const comicsDirectoryWriteStatus = await Deno.permissions.query({name: "write", path: env.COMICS_DIRECTORY});

  assertEquals(comicsDirectoryReadStatus.state, "granted", "Read permission is missing for the Comics directory! Use --allow-read")
  assertEquals(comicsDirectoryWriteStatus.state, "granted", "Write permission is missing for the Comics directory! Use --allow-write")

  try {
    const info = await Deno.stat(env.COMICS_DIRECTORY)
    assert(info.isDirectory, "Comics path exists but it is a file, not a directory");
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      await Deno.mkdir(env.COMICS_DIRECTORY, {recursive: true})
    } else {
      throw error;
    }
  }

  const configDirectoryReadStatus = await (Deno.permissions.query({name: "read", path: env.CONFIG_DIRECTORY}))
  const configDirectoryWriteStatus = await (Deno.permissions.query({name: "write", path: env.CONFIG_DIRECTORY}))

  assertEquals(configDirectoryReadStatus.state, "granted", "Read permission is missing for the Config directory! Use --allow-read")
  assertEquals(configDirectoryWriteStatus.state, "granted", "Write permission is missing for the Config directory! Use --allow-write")

  try {
    const info = await Deno.stat(env.CONFIG_DIRECTORY)
    assert(info.isDirectory, "Config path exists but it is a file, not a directory");
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      await Deno.mkdir(env.CONFIG_DIRECTORY, {recursive: true})
    } else {
      throw error;
    }
  }

  const cacheDirectoryReadStatus = await (Deno.permissions.query({name: "read", path: env.APP_CACHE_PATH}))
  const cacheDirectoryWriteStatus = await (Deno.permissions.query({name: "write", path: env.APP_CACHE_PATH}))

  assertEquals(cacheDirectoryReadStatus.state, "granted", "Read permission is missing for the Cache directory! Use --allow-read")
  assertEquals(cacheDirectoryWriteStatus.state, "granted", "Write permission is missing for the Cache directory! Use --allow-write")

  try {
    const info = await Deno.stat(env.APP_CACHE_PATH)
    assert(info.isDirectory, "Cache path exists but it is a file, not a directory");
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      await Deno.mkdir(env.APP_CACHE_PATH, {recursive: true})
    } else {
      throw error;
    }
  }
})