
import type { ComicInfo } from "npm:comic-metadata-tool";

export interface ComicMetadata {
  comicInfoXml?: ComicInfo;
  filePath: string;
  [key: string]: unknown;
}