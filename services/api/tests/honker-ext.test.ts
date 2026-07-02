import { expect, test } from "bun:test"
import { existsSync } from "node:fs"

import { getTempQueue } from "kitsune-komix-database";

test("Extension exists", async () => {
  const path: string = "/honker/libhonker_ext.so"

  const doesTheBinaryExtensionFileExist: boolean = existsSync(path)

  expect(doesTheBinaryExtensionFileExist).toBe(true)
})

test("Honker enqueue action works", async () => {
  const tempQueue = await getTempQueue();

  tempQueue.enqueue({message: "test"})

  const job = tempQueue.claimOne("test-worker")

  expect(job).toBeTruthy()

  const payload = job?.payload as {message: string}

  expect(payload).toBeDefined()

  expect(payload.message).toBe("test")

  job?.ack()

  const newJob = tempQueue.claimOne("test-worker")

  expect(newJob).toBe(null)
})
