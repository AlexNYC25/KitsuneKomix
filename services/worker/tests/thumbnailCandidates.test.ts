import { expect, test } from "bun:test"

import { buildThumbnailCandidates } from "../utilities/thumbnailCandidates"

import type {
  ArchiveEntry,
  ConsolidatedPageInfo,
} from "../shared/types/utilities.types"

const files: ArchiveEntry[] = [
  { path: "a-01.jpg", size: 1 },
  { path: "b-02.jpg", size: 2 },
  { path: "c-03.jpg", size: 3 },
]

test("includes only the first image when there is no metadata", () => {
  const candidates = buildThumbnailCandidates(files, [])

  expect(candidates.map(c => c.path)).toEqual(["a-01.jpg"])
})

test("includes FrontCover pages from the metadata alongside the first image", () => {
  const metadataPages: ConsolidatedPageInfo[] = [
    { image: 1, type: "Story" },
    { image: 2, type: "FrontCover" },
    { image: 3, type: "Story" },
  ]

  const candidates = buildThumbnailCandidates(files, metadataPages)

  expect(candidates.map(c => c.path)).toEqual(["a-01.jpg", "b-02.jpg"])
})

test("does not duplicate the first image when it is also the FrontCover", () => {
  const metadataPages: ConsolidatedPageInfo[] = [
    { image: 1, type: "FrontCover" },
  ]

  const candidates = buildThumbnailCandidates(files, metadataPages)

  expect(candidates.map(c => c.path)).toEqual(["a-01.jpg"])
})

test("skips FrontCover image numbers that fall outside the archive files", () => {
  const metadataPages: ConsolidatedPageInfo[] = [
    { image: 1, type: "FrontCover" },
    { image: 99, type: "FrontCover" },
  ]

  const candidates = buildThumbnailCandidates(files, metadataPages)

  expect(candidates.map(c => c.path)).toEqual(["a-01.jpg"])
})

test("returns an empty list for an empty archive", () => {
  const candidates = buildThumbnailCandidates([], [])

  expect(candidates).toEqual([])
})