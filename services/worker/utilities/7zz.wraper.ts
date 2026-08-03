import { path7z } from "7zip-bin-full";

/**
 * Wrapper call to the 7zz executable for the list functionality
 * 
 * Equivalent: 7zz l <filePath>
 * 
 * @param filePath - the path to the archive
 * @returns - the output of the 7zz call as a string
 */
export const list = async (filePath: string): Promise<string> => {
  const processCall = Bun.spawn([
    path7z,
    "l",
    "-ba",
    filePath
  ])

  const text = await new Response(processCall.stdout).text();

  return text
}