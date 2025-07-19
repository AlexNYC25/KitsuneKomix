import {
  FILE_NAME_EXTENSION_WHITESPACE_REGEX,
  YEAR_SIMPLE_REGEX,
  TAGS_PARANTHESIS_REGEX,
  VOLUME_SIMPLE_REGEX,
  ISSUE_OF_REGEX,
  ISSUE_NUMBER_REGEX,
} from '../constants/regex.ts';

import { ComicFileProperties } from '../interfaces/comic-file-properties.interface.ts';


/**
 * Extracts the issue number from a limited run comic book name.
 * The expected format is "001 (of 12)" or similar.
 *
 * @param {string} name - The comic book name to extract the issue number from.
 * @returns {Object} An object containing the cleaned name and the issue number.
 */
function extractLimitedRunIssueNumber(name: string): {
  cleanedName: string;
  issueNumber: string;
} {
  const match = name.match(ISSUE_OF_REGEX);
  if (!match) return { cleanedName: name, issueNumber: '' };

  const issueNumber = String(Number(match[1]));
  const cleanedName = name.replace(match[0], '').trim();

  return { cleanedName, issueNumber };
}

/**
 * Extracts the year from a comic book name.
 * The expected format is "Series Name (Year)" or similar.
 *
 * @param {string} name - The comic book name to extract the year from.
 * @returns {Object} An object containing the cleaned name and the year.
 */
function extractYear(name: string): {
  cleanedName: string;
  year: string;
} {
  const match = name.match(YEAR_SIMPLE_REGEX);
  const year = match?.[1] || '';
  const cleanedName = match ? name.slice(0, match.index ?? 0).trim() : name;

  return { cleanedName, year };
}

/**
 * Extracts tags from a comic book name.
 * Tags are expected to be enclosed in parentheses, e.g., "(Tag1) (Tag2)".
 *
 * @param {string} name - The comic book name to extract tags from.
 * @param {string} yearToExclude - The year to exclude from the tags.
 * @returns {string[]} An array of extracted tags.
 */
function extractTags(name: string, yearToExclude: string): string[] {
  return [...name.matchAll(TAGS_PARANTHESIS_REGEX)]
    .map(match => match[1].trim())
    .filter(tag => tag !== yearToExclude);
}


/**
 * Extracts the volume number from a comic book name.
 * The expected format is "Series Name Vol. 1" or similar.
 *
 * @param {string} name - The comic book name to extract the volume number from.
 * @returns {Object} An object containing the cleaned name and the volume number.
 */
function extractVolume(name: string): {
  cleanedName: string;
  volumeNumber: string;
} {
  const match = name.match(VOLUME_SIMPLE_REGEX);
  if (!match) return { cleanedName: name, volumeNumber: '' };

  const volumeNumber = match[1];
  const cleanedName = name.replace(match[0], '').trim();

  return { cleanedName, volumeNumber };
}


/**
 * Extracts the issue number from a comic book name.
 * The expected format is "Series Name 001" or similar.
 *
 * @param {string} name - The comic book name to extract the issue number from.
 * @returns {Object} An object containing the cleaned name and the issue number.
 */
function extractIssueNumber(name: string): {
  cleanedName: string;
  issueNumber: string;
} {
  const match = name.match(ISSUE_NUMBER_REGEX);
  if (!match) return { cleanedName: name, issueNumber: '' };

  const issueNumber = String(Number(match[1]));
  const cleanedName = name.replace(match[0], '').trim();

  return { cleanedName, issueNumber };
}


/**
 * Parses a comic book filename to extract its properties.
 * The filename is expected to follow a specific format that includes series name,
 * issue number, volume number, year, and tags.
 *
 * @param {string} filename - The comic book filename to parse.
 * @returns {Object} An object containing the parsed properties:
 *   - seriesName: The name of the comic book series.
 *   - issueNumber: The issue number of the comic book.
 *   - volumeNumber: The volume number of the comic book.
 *   - year: The year of publication.
 *   - tags: An array of tags associated with the comic book.
 */
export function getComicFileProperties(filename: string): ComicFileProperties {
  let seriesName = filename.replace(FILE_NAME_EXTENSION_WHITESPACE_REGEX, '').trim();
  let issueNumber = '';
  let volumeNumber = '';
  let year = '';
  let tags: string[] = [];

  // Edge case for limited run i.e "001 (of 12)"
  const limitedRunResult = extractLimitedRunIssueNumber(seriesName);
  seriesName = limitedRunResult.cleanedName;
  issueNumber = limitedRunResult.issueNumber;

  const yearResult = extractYear(seriesName);
  seriesName = yearResult.cleanedName;
  year = yearResult.year;

  const cleanedForTags = filename.replace(ISSUE_OF_REGEX, '').trim();
  tags = extractTags(cleanedForTags, year);

  const volumeResult = extractVolume(seriesName);
  seriesName = volumeResult.cleanedName;
  volumeNumber = volumeResult.volumeNumber;

  // Final parse after extracting volume, year, tags, and issue number
  // assuming that we have not extracted the issue number yet, then we must do it now
  // expecting the format to be something like "Series Name 001" at this point
  if (!issueNumber) {
    const issueResult = extractIssueNumber(seriesName);
    seriesName = issueResult.cleanedName;
    issueNumber = issueResult.issueNumber;
  }

  return {
    seriesName,
    issueNumber,
    volumeNumber,
    year,
    tags,
  };
}
