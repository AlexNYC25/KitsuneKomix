import {
  FILE_NAME_EXTENSION_WHITESPACE_REGEX,
  YEAR_SIMPLE_REGEX,
  TAGS_PARANTHESIS_REGEX,
  VOLUME_SIMPLE_REGEX,
  ISSUE_OF_REGEX,
  ISSUE_NUMBER_REGEX,
} from '../constants/regex.ts';

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

function extractYear(name: string): {
  cleanedName: string;
  year: string;
} {
  const match = name.match(YEAR_SIMPLE_REGEX);
  const year = match?.[1] || '';
  const cleanedName = match ? name.slice(0, match.index ?? 0).trim() : name;

  return { cleanedName, year };
}

function extractTags(name: string, yearToExclude: string): string[] {
  return [...name.matchAll(TAGS_PARANTHESIS_REGEX)]
    .map(match => match[1].trim())
    .filter(tag => tag !== yearToExclude);
}

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

export function getComicFileProperties(filename: string): {
  seriesName: string;
  issueNumber: string;
  volumeNumber: string;
  year: string;
  tags: string[];
} {
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
