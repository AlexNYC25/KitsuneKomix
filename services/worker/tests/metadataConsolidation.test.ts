import {
  expect,
  test,
} from "bun:test"
import type { MetadataCompiled } from "comic-metadata-tool"
import { consolidateComicMetadata } from "../utilities/metadataConsolidation"

const makeCompiled = (overrides: Partial<MetadataCompiled>): MetadataCompiled => ({
  archiveType: "zip",
  archivePath: "/tmp/test.cbz",
  xmlFilePresent: false,
  zipCommentPresent: false,
  ...overrides,
})

test("consolidates overlapping fields with ComicInfo.xml taking priority", () => {
  const compiled = makeCompiled({
    comicInfoXml: {
      title: "Batman",
      series: "Batman",
      number: "1",
      publisher: "DC",
      year: 2020,
      writer: "Scott Snyder",
    },
    coMet: {
      title: "Batman (Old)",
      series: "Batman",
      issue: 1,
      publisher: "Marvel",
      date: "2020-05-10",
      readingDirection: "ltr",
      writer: ["Scott Snyder", "Greg Capullo"],
    },
    comicbookinfo: {
      appID: "test",
      lastModified: "2020-01-01",
      "ComicBookInfo/1.0": {
        series: "Batman",
        title: "Batman",
        publisher: "Vertigo",
        publicationMonth: 5,
        publicationYear: 2020,
        issue: 1,
        numberOfIssues: 3,
        volume: 1,
        numberOfVolumes: 0,
        rating: 4,
        genre: "Superhero",
        language: "en",
        country: "",
        credits: [{ person: "Scott Snyder", role: "Writer" }],
        tags: ["digital"],
        comments: "notes here",
      },
    },
  })

  const result = consolidateComicMetadata(compiled)

  // ComicInfo wins for title
  expect(result.title).toBe("Batman")
  expect(result.series).toBe("Batman")
  expect(result.issueNumber).toBe("1")
  expect(result.publisher).toBe("DC")
  expect(result.year).toBe(2020)
  // month/day come from CoMet date fallback when ComicInfo has none
  expect(result.month).toBe(5)
  expect(result.day).toBe(10)
  expect(result.count).toBe(3)
  expect(result.publicationDate).toBe("2020")

  // credits gathered and deduplicated across sources
  const writers = result.credits.filter(c => c.role === "Writer")
  expect(writers).toHaveLength(2)
  expect(writers.map(w => w.person)).toContain("Scott Snyder")
  expect(writers.map(w => w.person)).toContain("Greg Capullo")
  // the same person/role only appears once even across multiple sources
  expect(writers.filter(w => w.person === "Scott Snyder")).toHaveLength(1)

  // tags from ComicBookInfo
  expect(result.tags).toContain("digital")
})

test("uses ComicBookInfo data when ComicInfo is not present", () => {
  const compiled = makeCompiled({
    comicbookinfo: {
      appID: "test",
      lastModified: "2020-01-01",
      "ComicBookInfo/1.0": {
        series: "Spider-Man",
        title: "Amazing Spider-Man",
        publisher: "Marvel",
        publicationMonth: 7,
        publicationYear: 2019,
        issue: 12,
        numberOfIssues: 0,
        volume: 0,
        numberOfVolumes: 0,
        rating: 3,
        genre: "Action, Adventure",
        language: "en",
        country: "US",
        credits: [{ person: "Stan Lee", role: "Writer" }],
        tags: [],
        comments: "",
      },
    },
  })

  const result = consolidateComicMetadata(compiled)

  expect(result.title).toBe("Amazing Spider-Man")
  expect(result.series).toBe("Spider-Man")
  expect(result.issueNumber).toBe("12")
  expect(result.publisher).toBe("Marvel")
  expect(result.year).toBe(2019)
  expect(result.month).toBe(7)
  expect(result.language).toBe("en")
  expect(result.genres).toContain("Action")
  expect(result.genres).toContain("Adventure")
  expect(result.communityRating).toBe(3)
  expect(result.ageRating).toBe("3")
})

test("uses CoMet data as a fallback for exclusive fields", () => {
  const compiled = makeCompiled({
    coMet: {
      title: "Saga",
      series: "Saga",
      issue: 1,
      volume: 2,
      date: "2012-03-14",
      description: "An epic space opera",
      genre: ["Fantasy", "Sci-Fi"],
      character: ["Alana"],
      language: "en",
      format: "Single Issue",
      readingDirection: "ltr",
      rating: "Everyone",
      pages: [1, 2, 3],
    },
  })

  const result = consolidateComicMetadata(compiled)

  expect(result.title).toBe("Saga")
  expect(result.series).toBe("Saga")
  expect(result.issueNumber).toBe("1")
  expect(result.volumeNumber).toBe("2")
  expect(result.year).toBe(2012)
  expect(result.month).toBe(3)
  expect(result.day).toBe(14)
  expect(result.summary).toBe("An epic space opera")
  expect(result.genres).toContain("Fantasy")
  expect(result.genres).toContain("Sci-Fi")
  expect(result.characters).toContain("Alana")
  expect(result.readingDirection).toBe("ltr")
  expect(result.pageCount).toBe(3)
  expect(result.pages).toHaveLength(3)
  expect(result.pages[0]?.type).toBe("FrontCover")
})

test("returns empty collections when nothing is available", () => {
  const result = consolidateComicMetadata(makeCompiled({}))

  expect(result.genres).toEqual([])
  expect(result.storyArcs).toEqual([])
  expect(result.characters).toEqual([])
  expect(result.credits).toEqual([])
  expect(result.pages).toEqual([])
  expect(result.tags).toEqual([])
  expect(result.title).toBeUndefined()
})
