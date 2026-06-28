import { expect, test } from "bun:test"
import { existsSync } from "node:fs"

import { enqueue } from "kitsune-komix-database";

test("Extension exists", async () => {
  const path: string = "/honker/libhonker_ext.so"

  const doesTheBinaryExtensionFileExist: boolean = existsSync(path)

  expect(doesTheBinaryExtensionFileExist).toBe(true)
})

test("Honker enqueue action works", async () => {
  const queueOptions = {
    name: "test",
    maxAttempts: 3
  }

  const queueItemOptions = {
    delay: undefined,
    priority: undefined
  }

  enqueue(queueOptions, queueItemOptions, "TEST")
})
