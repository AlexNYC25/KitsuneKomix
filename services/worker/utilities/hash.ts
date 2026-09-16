
/**
 * Generates a hash for a file using Bun native libraries for speed
 * @param filePath The path to a file type
 * @returns a number | bigint hash value for the file
 */
export const generateHashForFile = async (filePath: string) => {
  const file: Bun.BunFile = Bun.file(filePath)

  const fileArrayBuffer: ArrayBuffer = await file.arrayBuffer()

  const fileHash: number | bigint = Bun.hash(fileArrayBuffer)

  return fileHash
}

/**
 * Generates a hash for in-memory data using Bun native libraries for speed
 * @param data The bytes to hash
 * @returns a number | bigint hash value for the data
 */
export const generateHashForBuffer = (data: ArrayBuffer) => {
  const fileHash: number | bigint = Bun.hash(data)

  return fileHash
}