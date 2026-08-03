import type { List7zzFileOutput } from "../shared/types/utilities.types"

const entryRegex = /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+(\S{5})\s+(\d+)\s+(\d+)\s+(.+)$/

/**
 * Takes the raw output of the 7zz exec, and parses it to an object format
 * @param output the string output from the list 7zz wrapper function
 * @returns an array of List7zzFileOutput objects
 */
export const parseListOutput = (output: string): List7zzFileOutput[] => {
  const lines: string[] = output.trim().split('\n')

  const parsedLines: List7zzFileOutput[] = []

  for (const line of lines) {
    const match: RegExpMatchArray | null = line.match(entryRegex)

    if (!match) continue

    const [, date, time, attr, size, compressed, name] = match

    parsedLines.push({ date, time, attr, size, compressed, name } as List7zzFileOutput)
  }

  parsedLines.sort((a: List7zzFileOutput, b: List7zzFileOutput) => {
    return a.name.localeCompare(b.name)
  }) 

  return parsedLines
}