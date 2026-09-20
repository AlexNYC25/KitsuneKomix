import { path7z } from "7zip-bin-full";

/**
 * Wrapper call to the 7zz executable for the list functionality
 * 
 * Equivalent: 7zz l <filePath>
 * 
 * @param filePath - the path to the archive
 * @returns - the output of the 7zz call as a string
 * @throws If 7zz fails to list the archive
 */
export const list = async (filePath: string): Promise<string> => {
  const processCall = Bun.spawn([
    path7z,
    "l",
    "-ba",
    filePath
  ])

  const text = await new Response(processCall.stdout).text();

  const exitCode = await processCall.exited

  if (exitCode !== 0) {
    const stderr = await new Response(processCall.stderr).text()
    throw new Error(`7zz failed to list archive ${filePath} (exit ${exitCode}): ${stderr}`)
  }

  return text
}

/**
 * Wrapper call to the 7zz executable for extracting a single entry to stdout
 * 
 * Equivalent: 7zz e <filePath> -so <entry>
 * 
 * Streams the entry's bytes to stdout without writing anything to disk,
 * making it easy to hash or inspect an entry in place.
 * 
 * @param filePath - the path to the archive
 * @param entryPath - the path of the entry within the archive
 * @returns - the entry's bytes as an ArrayBuffer
 * @throws If 7zz fails to extract the entry
 */
export const extractEntry = async (filePath: string, entryPath: string): Promise<ArrayBuffer> => {
  const processCall = Bun.spawn([
    path7z,
    "e",
    filePath,
    "-so",
    entryPath
  ])

  const arrayBuffer = await new Response(processCall.stdout).arrayBuffer();

  const exitCode = await processCall.exited

  if (exitCode !== 0) {
    const stderr = await new Response(processCall.stderr).text()
    throw new Error(`7zz failed to extract ${entryPath} from ${filePath} (exit ${exitCode}): ${stderr}`)
  }

  return arrayBuffer
}