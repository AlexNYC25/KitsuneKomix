
import { YEAR_EXPANDED_REGEX, VOLUME_EXPANDED_REGEX, TAGS_BRACKETS_REGEX } from "../constants/regex.ts";

function extractTags(name: string): {
  seriesTags: string[],
  updatedName: string
} {
  const tags: string[] = [];
  const tagMatches = name.matchAll(TAGS_BRACKETS_REGEX);
  for (const match of tagMatches) {
    if (match[1]) {
      tags.push(match[1].trim());
    }
  }
  return {
    seriesTags: Array.from(new Set(tags)), // Remove duplicates
    updatedName: name.replace(TAGS_BRACKETS_REGEX, '')
  };
}

function extractYear(name: string): {
  seriesYear: string,
  updatedName: string
} {
  const yearMatch = name.match(YEAR_EXPANDED_REGEX);
  if (yearMatch) {
    const year = yearMatch[1] || yearMatch[2] || '';
    return {
      seriesYear: year,
      updatedName: name.replace(yearMatch[0], '')
    };
  }
  return { seriesYear: '', updatedName: name };
}

function extractVolume(name: string): {
  seriesVolume: string,
  updatedName: string
} {
  const volumeMatch = name.match(VOLUME_EXPANDED_REGEX);
  if (volumeMatch) {
    const volume = volumeMatch[1];
    return {
      seriesVolume: volume,
      updatedName: name.replace(volumeMatch[0], '')
    };
  }

  return { seriesVolume: '', updatedName: name };
}

/**
 * Extracts basic comic series metadata from a folder name
 * 
 * @param {string} foldername - The name of the folder to parse
 * @returns {Object} An object containing the series name, year, volume, and tags
 * @property {string} seriesName - The name of the comic series
 * @property {string} seriesYear - The year of the comic series
 * @property {string} seriesVolume - The volume number of the comic series
 * @property {string[]} seriesTags - An array of tags associated with the comic series
 */
export function getSeriesFolderProperties(foldername: string): {
  seriesName: string;
  seriesYear: string;
  seriesVolume: string;
  seriesTags: string[];
} {
  let name = foldername;
  let year = '';
  let volume = '';
  const tags = [];

  // Extract tags in [brackets]
  // Note for now we just extract tags and don't validate them against a known list, or even if we should
  const tagExtraction = extractTags(name);
  tags.push(...tagExtraction.seriesTags);
  name = tagExtraction.updatedName;

  // Extract year
  const yearExtraction = extractYear(name);
  year = yearExtraction.seriesYear;
  name = yearExtraction.updatedName;

  // Extract volume
  const volumeExtraction = extractVolume(name);
  volume = volumeExtraction.seriesVolume;
  name = volumeExtraction.updatedName;

  return {
    seriesName: name.trim(),
    seriesYear: year.trim(),
    seriesVolume: volume.trim(),
    seriesTags: tags.map(tag => tag.trim()) ?? [],
  };
}
