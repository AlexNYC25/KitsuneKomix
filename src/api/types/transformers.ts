import type { 
  User, 
  ComicLibrary, 
  ComicBook, 
  UserDomain,
  LibraryDomain,
  ComicBookDomain 
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
    volume: book.volume || undefined,
    publisher: book.publisher || undefined,
    publicationDate: book.publication_date || undefined,
    tags: book.tags ? book.tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined,
    read: Boolean(book.read),
    createdAt: book.created_at,
    updatedAt: book.updated_at,
  };
}

/**
 * Parse comma-separated tags string to array
 */
export function parseTagsFromString(tags: string | null): string[] | undefined {
  if (!tags) return undefined;
  return tags.split(',').map(tag => tag.trim()).filter(Boolean);
}

/**
 * Convert tags array to comma-separated string
 */
export function tagsToString(tags: string[] | undefined): string | undefined {
  if (!tags || tags.length === 0) return undefined;
  return tags.join(', ');
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
