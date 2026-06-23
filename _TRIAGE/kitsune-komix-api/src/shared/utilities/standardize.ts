
/**
 * Local helper function to deduplicate metadata entities by their ID.
 */
export const dedupeById = <T extends { id: number | string }>(items: T[]): T[] => {
  const uniqueCredits = new Map<number | string, T>();
  for (const credit of items) {
    uniqueCredits.set(credit.id, credit);
  }
  return Array.from(uniqueCredits.values());
};