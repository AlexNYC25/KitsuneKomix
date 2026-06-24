import { assertEquals } from "@std/assert"
import { exists } from "@std/fs/exists"

Deno.test("Extension exists", async () => {
  const path: string = "/honker/libhonker_ext.so"

  const doesTheBinaryExtensionFileExist: boolean = await exists(path)

  assertEquals(doesTheBinaryExtensionFileExist, true, "The Honker Extension file does not exist, check the dockerfile/local build")
})