import { afterAll, beforeAll, expect, test } from "bun:test"
import { path7z } from "7zip-bin-full"

import { getArchivesManifest } from "../utilities/archive"
import type { ArchiveManifest } from "../shared/types/utilities.types"

const testDir = "/tmp/kk-archive-test"
const archivePath = `${testDir}/test.cbz`

const firstPagePath = "image-01.jpg"
const secondPagePath = "image-02.png"
const nonImagePath = "notes.txt"
const metadataPath = "ComicInfo.xml"

beforeAll(async () => {
  await Bun.$`mkdir -p ${testDir}`
  await Bun.write(`${testDir}/${firstPagePath}`, "fake jpeg bytes")
  await Bun.write(`${testDir}/${secondPagePath}`, "fake png bytes")
  await Bun.write(`${testDir}/${nonImagePath}`, "not a page")
  await Bun.write(`${testDir}/${metadataPath}`, "<ComicInfo><Title>Test</Title></ComicInfo>")
  await Bun.$`${path7z} a -tzip ${archivePath} ${firstPagePath} ${secondPagePath} ${nonImagePath} ${metadataPath}`.cwd(testDir)
})

afterAll(async () => {
  await Bun.$`rm -rf ${testDir}`
})

test("Archive Listing", async () => {
  const archiveReturn: ArchiveManifest | undefined = await getArchivesManifest(archivePath)

  expect(archiveReturn).toBeDefined()
  expect(archiveReturn?.archiveSize).toBeGreaterThan(0)
  expect(archiveReturn?.files.length).toBeGreaterThan(0)
  expect(archiveReturn?.type).toBe("cbz")
  expect(archiveReturn?.metadataExists).toBe(true)

  const entryPaths: string[] = archiveReturn?.files.map((entry) => entry.path) ?? []
  expect(entryPaths).toContain(firstPagePath)
  expect(entryPaths).toContain(secondPagePath)
  expect(entryPaths).not.toContain(nonImagePath)
})