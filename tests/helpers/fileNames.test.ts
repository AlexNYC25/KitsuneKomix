import { assertEquals } from "jsr:@std/assert";
import { getComicFileProperties } from "../../src/helpers/fileNames.ts";

Deno.test("getComicFileProperties - parse basic comic file name properties", () => {
  const comicFiles = {
    "Batman 001 (2011) (DC Comics).cbr": {
      seriesName: "Batman",
      issueNumber: "1",
      volumeNumber: "",
      year: "2011",
      tags: ["DC Comics"],
    },
    "Moon Knight 194 (2018) (digital) (Zone-Empire).cbz": {
      seriesName: "Moon Knight",
      issueNumber: "194",
      volumeNumber: "",
      year: "2018",
      tags: ["digital", "Zone-Empire"],
    },
    "Amazing Spider-Man v1 053 (1967) (Digital) (TLK-Empire-HD).cbz": {
      seriesName: "Amazing Spider-Man",
      issueNumber: "53",
      volumeNumber: "1",
      year: "1967",
      tags: ["Digital", "TLK-Empire-HD"],
    },
    "Marvel Super-Heroes Secret Wars 11 (of 12) (1985) (digital) (Son of Ultron-Empire).cbz": {
      seriesName: "Marvel Super-Heroes Secret Wars",
      issueNumber: "11",
      volumeNumber: "",
      year: "1985",
      tags: ["digital", "Son of Ultron-Empire"],
    },
    "What If - Jessica Jones Had Joined the Avengers 001 (2004) (Digital) (AnPymGold-Empire).cbz": {
      seriesName: "What If - Jessica Jones Had Joined the Avengers",
      issueNumber: "1",
      volumeNumber: "",
      year: "2004",
      tags: ["Digital", "AnPymGold-Empire"],
    },
    "Kick Ass 2 001 (2010) (Digital) (Zone-Empire).cbz": {
      seriesName: "Kick Ass 2",
      issueNumber: "1",
      volumeNumber: "",
      year: "2010",
      tags: ["Digital", "Zone-Empire"],
    },
  };

  for (const [filename, expected] of Object.entries(comicFiles)) {
    const result = getComicFileProperties(filename);
    assertEquals(result, expected);
  }
});