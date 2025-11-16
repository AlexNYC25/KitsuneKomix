import type { paths } from '../openapi/openapi-schema';

// /comic-libraries endpoint types
export type GetComicLibrariesResponse = paths['/comic-libraries']['get']['responses']['200']['content']['application/json'];

export type ComicLibrariesData = GetComicLibrariesResponse['data'];

export type ComicLibrary = Extract<ComicLibrariesData, unknown[]>[number];
