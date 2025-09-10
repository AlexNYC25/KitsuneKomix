import type {
  ComicBook,
  ComicBookDomain,
  ComicLibrary,
  LibraryDomain,
  User,
  UserDomain,
} from "./index.ts";

/**
 * Transform database user to domain user (safe user without password)
 */
export function userToDomain(user: User): UserDomain {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.first_name || undefined,
    lastName: user.last_name || undefined,
    admin: Boolean(user.admin),
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

/**
 * Transform database library to domain library
 */
export function libraryToDomain(library: ComicLibrary): LibraryDomain {
  return {
    id: library.id,
    name: library.name,
    description: library.description || undefined,
    path: library.path,
    enabled: Boolean(library.enabled),
    changedAt: library.changed_at,
    createdAt: library.created_at,
    updatedAt: library.updated_at,
  };
}

/**
 * Transform database comic book to domain comic book
 */
export function comicBookToDomain(book: ComicBook): ComicBookDomain {
  return {
    id: book.id,
    libraryId: book.library_id,
    filePath: book.file_path,
    hash: book.hash,
    title: book.title || undefined,
    series: book.series || undefined,
    issueNumber: book.issue_number || undefined,
    count: book.count || undefined,
    volume: book.volume || undefined,
    alternateSeries: book.alternate_series || undefined,
    alternateIssueNumber: book.alternate_issue_number || undefined,
    alternateCount: book.alternate_count || undefined,
    pageCount: book.page_count || undefined,
    summary: book.summary || undefined,
    notes: book.notes || undefined,
    year: book.year || undefined,
    month: book.month || undefined,
    day: book.day || undefined,
    publisher: book.publisher || undefined,
    publicationDate: book.publication_date || undefined,
    scanInfo: book.scan_info || undefined,
    language: book.languge || undefined, // Note: correcting schema typo in domain
    format: book.format || undefined,
    blackAndWhite: Boolean(book.black_and_white),
    manga: Boolean(book.manga),
    readingDirection: book.reading_direction || undefined,
    review: book.review || undefined,
    ageRating: book.age_rating || undefined,
    communityRating: book.community_rating || undefined,
    createdAt: book.created_at,
    updatedAt: book.updated_at,
  };
}

/**
 * Parse comma-separated tags string to array
 */
export function parseTagsFromString(tags: string | null): string[] | undefined {
  if (!tags) return undefined;
  return tags.split(",").map((tag) => tag.trim()).filter(Boolean);
}

/**
 * Convert tags array to comma-separated string
 */
export function tagsToString(tags: string[] | undefined): string | undefined {
  if (!tags || tags.length === 0) return undefined;
  return tags.join(", ");
}

/**
 * Convert integer boolean to boolean
 */
export function intToBool(value: number): boolean {
  return Boolean(value);
}

/**
 * Convert boolean to integer boolean
 */
export function boolToInt(value: boolean): number {
  return value ? 1 : 0;
}
