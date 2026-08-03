import { 
  expect,
  test
} from "bun:test"

import { getArchivesManifest } from "../utilities/archive"
import type { ArchiveManifest } from "../shared/types/utilities.types"

test("Archive Listing", async () => {
  const testFileLocation: string = "/Volumes/T7/Comics/Bulk comics/Blackest Night - JSA 001 (2010) (Digital) (Monafekk-Empire).cbz"
  const archiveReturn: ArchiveManifest | undefined = await getArchivesManifest(testFileLocation)
  

  if (testFileLocation.length == 0){
    return
  }

  expect(archiveReturn).toBeDefined()
  expect(archiveReturn?.archiveSize).toBeGreaterThan(0)
  expect(archiveReturn?.files.length).toBeGreaterThanOrEqual(0)
})