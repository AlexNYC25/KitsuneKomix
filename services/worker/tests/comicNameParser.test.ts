import {
  parseComicNameForDetails
} from "../utilities/comicNameParser"

import { 
  expect,
  test
} from "bun:test"

test("Testing the parser utility", () => {
  const cyberPunkResult = parseComicNameForDetails("Cyberpunk 2077 - Chrome 04 (of 04) (2026) (digital) (Son of Ultron-Empire)")
  //console.log(cyberPunkResult)
  expect(cyberPunkResult.year).toBe(2026)
  expect(cyberPunkResult.count).toBe(4)
  expect(cyberPunkResult.format).toBe("digital")
  expect(cyberPunkResult.tags).toBeArray()
  expect(cyberPunkResult.tags).toBeArrayOfSize(1)
  expect(cyberPunkResult.volume).toBeUndefined()
  expect(cyberPunkResult.issue).toBe("4")
  expect(cyberPunkResult.seriesName).toBe("Cyberpunk 2077 - Chrome")

  const moonKnightResult = parseComicNameForDetails("Moon Knight Special Edition (Volume 1) #1.cbz")
  //console.log(moonKnightResult)
  expect(moonKnightResult.volume).toBe(1)
  expect(moonKnightResult.issue).toBe("1")
  expect(moonKnightResult.seriesName).toBe("Moon Knight Special Edition")

  const spyFamilyResult = parseComicNameForDetails("Spy x Family v01 (2020) (Digital) (LuCaZ).cbz")
  //console.log(spyFamilyResult)
  expect(spyFamilyResult.year).toBe(2020)
  expect(spyFamilyResult.format).toBe("digital")
  expect(spyFamilyResult.volume).toBe(1)
  expect(spyFamilyResult.issue).toBeUndefined()
  expect(spyFamilyResult.seriesName).toBe("Spy x Family")

  const deadpoolResult = parseComicNameForDetails("Deadpool - Samurai v01 (2022) (Digital) (1r0n).cbz")
  expect(deadpoolResult.year).toBe(2022)
  expect(deadpoolResult.format).toBe("digital")
  expect(deadpoolResult.volume).toBe(1)
  expect(deadpoolResult.issue).toBeUndefined()
  expect(deadpoolResult.seriesName).toBe("Deadpool - Samurai")

  const onePieceResult = parseComicNameForDetails("One Piece 1188 (Digital).cbz ")
  //console.log(onePieceResult)
  expect(onePieceResult.year).toBeUndefined()
  expect(onePieceResult.format).toBe("digital")
  expect(onePieceResult.issue).toBe("1188")
  expect(onePieceResult.seriesName).toBe("One Piece")
})