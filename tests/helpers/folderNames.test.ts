import { assertEquals } from "jsr:@std/assert";
import { getSeriesFolderProperties } from "../../src/helpers/folderNames.ts";

Deno.test("getSeriesFolderProperties - parse basic series metadata properties from folder name", () => {
  const comicFolders = {
    "Batman (2011)": {
      seriesName: "Batman",
      seriesYear: "2011",
      seriesVolume: "",
      seriesTags: [],
    },
    "X-Men v2": {
      seriesName: "X-Men",
      seriesYear: "",
      seriesVolume: "2",
      seriesTags: [],
    },
    "Spider-Man Vol. 3 (2010)": {
      seriesName: "Spider-Man",
      seriesYear: "2010",
      seriesVolume: "3",
      seriesTags: [],
    },
    "Justice League Volume 4 (2015)": {
      seriesName: "Justice League",
      seriesYear: "2015",
      seriesVolume: "4",
      seriesTags: [],
    },
    "Thor - 2014": {
      seriesName: "Thor",
      seriesYear: "2014",
      seriesVolume: "",
      seriesTags: [],
    },
    "Saga [Image]": {
      seriesName: "Saga",
      seriesYear: "",
      seriesVolume: "",
      seriesTags: ["Image"],
    },
    "Green Lantern (2005) [DC] [Ongoing]": {
      seriesName: "Green Lantern",
      seriesYear: "2005",
      seriesVolume: "",
      seriesTags: ["DC", "Ongoing"],
    },
    "Wonder Woman v01 [Complete]": {
      seriesName: "Wonder Woman",
      seriesYear: "",
      seriesVolume: "01",
      seriesTags: ["Complete"],
    },
    "Avengers (2018) [Marvel]": {
      seriesName: "Avengers",
      seriesYear: "2018",
      seriesVolume: "",
      seriesTags: ["Marvel"],
    },
    "The Flash Vol. 5 (2016) [Rebirth]": {
      seriesName: "The Flash",
      seriesYear: "2016",
      seriesVolume: "5",
      seriesTags: ["Rebirth"],
    },
    "Deadpool [Marvel] [Humor] (2012)": {
      seriesName: "Deadpool",
      seriesYear: "2012",
      seriesVolume: "",
      seriesTags: ["Marvel", "Humor"],
    },
    "Iron Man Volume 1 - 1968": {
      seriesName: "Iron Man",
      seriesYear: "1968",
      seriesVolume: "1",
      seriesTags: [],
    },
    "Doctor Strange v03 (2015) [Marvel]": {
      seriesName: "Doctor Strange",
      seriesYear: "2015",
      seriesVolume: "03",
      seriesTags: ["Marvel"],
    },
    "Black Panther - 2018 [Movie Tie-In]": {
      seriesName: "Black Panther",
      seriesYear: "2018",
      seriesVolume: "",
      seriesTags: ["Movie Tie-In"],
    },
    "Superman - 2023 [Action Comics]": {
      seriesName: "Superman",
      seriesYear: "2023",
      seriesVolume: "",
      seriesTags: ["Action Comics"],
    },
    "Fantastic Four [Classic] [Marvel] (1961)": {
      seriesName: "Fantastic Four",
      seriesYear: "1961",
      seriesVolume: "",
      seriesTags: ["Classic", "Marvel"],
    },
    "Daredevil v4 [Mature Readers]": {
      seriesName: "Daredevil",
      seriesYear: "",
      seriesVolume: "4",
      seriesTags: ["Mature Readers"],
    },
    "Spawn [Image] [Dark Hero]": {
      seriesName: "Spawn",
      seriesYear: "",
      seriesVolume: "",
      seriesTags: ["Image", "Dark Hero"],
    },
    "Hellboy (1994) [Dark Horse]": {
      seriesName: "Hellboy",
      seriesYear: "1994",
      seriesVolume: "",
      seriesTags: ["Dark Horse"],
    },
    "Watchmen [Limited Series] (1986)": {
      seriesName: "Watchmen",
      seriesYear: "1986",
      seriesVolume: "",
      seriesTags: ["Limited Series"],
    },
    "Star Wars - Age Of Rebellion - Boba Fett (2019)": {
      seriesName: "Star Wars - Age Of Rebellion - Boba Fett",
      seriesYear: "2019",
      seriesVolume: "",
      seriesTags: [],
    },
    "Laura Kinney - Wolverine (2025)": {
      seriesName: "Laura Kinney - Wolverine",
      seriesYear: "2025",
      seriesVolume: "",
      seriesTags: [],
    },
    "Adam Strange - Future Quest Special (2017)": {
      seriesName: "Adam Strange - Future Quest Special",
      seriesYear: "2017",
      seriesVolume: "",
      seriesTags: [],
    },
  };

  for (const [folderName, expectedProperties] of Object.entries(comicFolders)) {
    const result = getSeriesFolderProperties(folderName);
    assertEquals(result, expectedProperties);
  }
});