import { afterAll, beforeAll, expect, test } from "bun:test"
import { path7z } from "7zip-bin-full"

import { extractEntry } from "../utilities/7zz.wraper"
import { generateHashForBuffer } from "../utilities/hash"

const testDir = "/tmp/kk-pages-hash-test"
const archivePath = `${testDir}/test.cbz`
const firstEntryPath = "image-01.png"
const secondEntryPath = "image-02.png"

beforeAll(async () => {
  await Bun.$`mkdir -p ${testDir}`
  await Bun.write(`${testDir}/${firstEntryPath}`, "first page bytes")
  await Bun.write(`${testDir}/${secondEntryPath}`, "second page bytes")
  await Bun.$`${path7z} a -tzip ${archivePath} ${firstEntryPath} ${secondEntryPath}`.cwd(testDir)
})

afterAll(async () => {
  await Bun.$`rm -rf ${testDir}`
})

test("extractEntry streams the correct entry bytes to memory", async () => {
  const firstBytes: ArrayBuffer = await extractEntry(archivePath, firstEntryPath)
  const secondBytes: ArrayBuffer = await extractEntry(archivePath, secondEntryPath)

  expect(new TextDecoder().decode(firstBytes)).toBe("first page bytes")
  expect(new TextDecoder().decode(secondBytes)).toBe("second page bytes")
})

test("generateHashForBuffer produces a stable non-zero hash for identical data", () => {
  const bytes = new TextEncoder().encode("first page bytes").buffer
  const firstHash = generateHashForBuffer(bytes)
  const secondHash = generateHashForBuffer(bytes)

  expect(firstHash).not.toBe(0)
  expect(firstHash).toBe(secondHash)

  const differentHash = generateHashForBuffer(new TextEncoder().encode("other data").buffer)
  expect(differentHash).not.toBe(firstHash)
})