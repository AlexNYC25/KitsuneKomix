import { assertEquals } from "@std/assert"
import { exists } from "@std/fs/exists"

import { enqueue } from "kitsune-komix-database";

Deno.test("Extension exists", async () => {
  const path: string = "/honker/libhonker_ext.so"

  const doesTheBinaryExtensionFileExist: boolean = await exists(path)

  assertEquals(doesTheBinaryExtensionFileExist, true, "The Honker Extension file does not exist, check the dockerfile/local build")
})

Deno.test("Honker enqueue action works", async () => {
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