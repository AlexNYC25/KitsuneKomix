import { expect, test } from "bun:test"
import { stat, mkdir } from "node:fs/promises"

import { env } from "../config/env.ts"

test("API can access app directories", async () => {
  try {
    const info = await stat(env.COMICS_DIRECTORY)
    expect(info.isDirectory()).toBe(true)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await mkdir(env.COMICS_DIRECTORY, { recursive: true })
    } else {
      throw error;
    }
  }

  try {
    const info = await stat(env.CONFIG_DIRECTORY)
    expect(info.isDirectory()).toBe(true)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await mkdir(env.CONFIG_DIRECTORY, { recursive: true })
    } else {
      throw error;
    }
  }

  try {
    const info = await stat(env.APP_CACHE_PATH)
    expect(info.isDirectory()).toBe(true)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await mkdir(env.APP_CACHE_PATH, { recursive: true })
    } else {
      throw error;
    }
  }
})
