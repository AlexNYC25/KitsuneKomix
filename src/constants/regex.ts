
export const YEAR_SIMPLE_REGEX = /\((\d{4})\)/;
export const YEAR_EXPANDED_REGEX = /\((\d{4})\)|(?:\s-\s|\s)(\d{4})/;

export const TAGS_PARANTHESIS_REGEX = /\(([^)]+)\)/g;
export const TAGS_BRACKETS_REGEX = /\[([^\]]+)\]/g;

export const VOLUME_SIMPLE_REGEX = /v(\d{1,3})/i;
export const VOLUME_EXPANDED_REGEX = /(?:v|vol(?:\.|ume)?)[\s]*(\d{1,3})/i;

export const ISSUE_OF_REGEX = /(\d{1,4})\s*\(of\s*\d{1,4}\)/i;
export const ISSUE_NUMBER_REGEX = /(?:^|\s)(\d{1,4})$/;

export const FILE_NAME_EXTENSION_WHITESPACE_REGEX = /\.[^.]+$/;

