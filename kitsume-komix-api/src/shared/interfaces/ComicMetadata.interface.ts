import type { ComicInfo } from "comic-metadata-tool";

export interface ComicMetadata {
  comicInfoXml?: ComicInfo;
  filePath: string;
  [key: string]: unknown;
}
