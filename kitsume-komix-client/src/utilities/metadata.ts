
export const convertArrayOfCreditsToString = (
  credits: Array<{ name: string }> | undefined
): string => {
  return credits?.map((credit: { name: string }) => credit.name).join(', ') ?? '';
};