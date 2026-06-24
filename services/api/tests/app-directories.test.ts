import { assertEquals } from "@std/assert"

import { env } from "../config/env.ts"

Deno.test("API can access app directories", async () => {
  let errorFound = false;
  
  const comicDirectoryInfo: Deno.FileInfo = await Deno.stat(env.COMICS_DIRECTORY)

  if (!comicDirectoryInfo.isDirectory){
    try {
      await Deno.mkdir(env.COMICS_DIRECTORY)

      await Deno.remove(env.COMICS_DIRECTORY)
    } catch (error) {
      console.log("error with comic directory: " + error)
      errorFound = true;
    }
  }

  const comicCacheDirectoryInfo: Deno.FileInfo = await Deno.stat(env.APP_CACHE_PATH)

  if (!comicCacheDirectoryInfo.isDirectory){
    try {
      await Deno.mkdir(env.APP_CACHE_PATH)

      await Deno.remove(env.APP_CACHE_PATH)
    } catch (error) {
      console.log("error with comic directory: " + error)
      errorFound = true;
    }
  }

  const configDirectoryInfo: Deno.FileInfo = await Deno.stat(env.CONFIG_DIRECTORY)

  if (!configDirectoryInfo.isDirectory){
    try {
      await Deno.mkdir(env.CONFIG_DIRECTORY)

      await Deno.remove(env.CONFIG_DIRECTORY)
    } catch (error) {
      console.log("error with comic directory: " + error)
      errorFound = true;
    }
  }

  assertEquals(errorFound, false)
})