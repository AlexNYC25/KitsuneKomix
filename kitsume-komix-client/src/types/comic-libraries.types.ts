import type { paths } from '../openapi/openapi-schema';

// /comic-libraries endpoint types
export type GetComicLibrariesResponse = paths['/comic-libraries']['get']['responses']['200']['content']['application/json'];

export type ComicLibrariesData = GetComicLibrariesResponse['data'];

// Library item - automatically extracted from the OpenAPI schema
// Since data is now always an array, extraction is straightforward
export type ComicLibrary = ComicLibrariesData extends (infer Item)[]
  ? Item
  : never;
