import { dirname } from "node:path";

export const getParentDirectory = (filePath: string): string => {
  return dirname(filePath);
};
