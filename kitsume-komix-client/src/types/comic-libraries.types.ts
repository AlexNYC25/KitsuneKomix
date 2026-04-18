import type { paths } from '../openapi/openapi-schema';

// /comic-libraries endpoint types
export type GetComicLibrariesResponse = paths['/comic-libraries']['get']['responses']['200']['content']['application/json'];

export type ComicLibrariesData = GetComicLibrariesResponse['libraries'];

type CreateLibraryRequestBody = NonNullable<
  paths['/comic-libraries/create-library']['post']['requestBody']
>;

export type CreateLibraryPayload = CreateLibraryRequestBody['content']['application/json'];

type UpdateLibraryRequestBody = NonNullable<
  paths['/comic-libraries/update-library/{id}']['post']['requestBody']
>;

export type UpdateLibraryPayload = UpdateLibraryRequestBody['content']['application/json'];

// Library item - automatically extracted from the OpenAPI schema
// Since data is now always an array, extraction is straightforward
export type ComicLibrary = ComicLibrariesData extends (infer Item)[]
  ? Item
  : never;
