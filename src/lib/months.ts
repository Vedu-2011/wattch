/**
 * Your own 12 months of use, typed or pasted from a bill's usage history.
 * Accepts numbers split by spaces, new lines, tabs, semicolons or ", ". "1,234" (a thousands comma) is one number.
 * Order: January → December. Returns null with a plain reason when it can't be used.
 */
export type MonthsResult = { months: number[] } | { error: string };

export function parseMonths(input: string): MonthsResult {
  const nums = (input.match(/\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?/g) ?? []).map((s) => Math.round(Number(s.replace(/,/g, ""))));
  if (nums.length === 0) return { error: "Type 12 numbers, one for each month's kWh." };
  if (nums.length !== 12) return { error: `That's ${nums.length} number${nums.length === 1 ? "" : "s"}. I need 12, January to December.` };
  if (nums.some((n) => n > 10000)) return { error: "One month is over 10,000 kWh. Check for a typo." };
  if (nums.every((n) => n === 0)) return { error: "All 12 months are 0." };
  return { months: nums };
}

export const average = (months: number[]) => Math.round(months.reduce((s, v) => s + v, 0) / months.length);

/** For the URL: ?m=820,700,…  (12 whole numbers). */
export const monthsToParam = (m: number[]) => m.join(".");
export function monthsFromParam(s: string | null | undefined): number[] | null {
  if (!s) return null;
  const r = parseMonths(s.replace(/\./g, " "));
  return "months" in r ? r.months : null;
}
