
import type { ComicInfo } from "npm:comic-metadata-tool@^1.1.0/dist/src/interfaces/comicInfo.d.ts";

export interface ComicMetadata {
  comicInfoXml?: ComicInfo;
  filePath: string;
  [key: string]: unknown;
}