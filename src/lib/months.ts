/**
 * Your own 12 months of use, typed or pasted from a bill's usage history.
 * Accepts numbers split by spaces, new lines, tabs, semicolons or ", ". "1,234" (a thousands comma) is one number.
 * Order: January → December. Returns null with a plain reason when it can't be used.
 */
export type MonthsResult = { months: number[] } | { error: string };

export const MONTHS_ERRORS = {
  en: {
    none: "Type 12 numbers, one for each month's kWh.",
    count: (n: number) => `That's ${n} number${n === 1 ? "" : "s"}. It takes 12, January to December.`,
    big: "One month is over 10,000 kWh. Check for a typo.",
    zero: "All 12 months are 0.",
  },
  es: {
    none: "Escribe 12 números, uno con los kWh de cada mes.",
    count: (n: number) => `${n === 1 ? "Es 1 número" : `Son ${n} números`}. Hacen falta 12, de enero a diciembre.`,
    big: "Un mes pasa de 10,000 kWh. Revisa si hay un error.",
    zero: "Los 12 meses están en 0.",
  },
} as const;

export function parseMonths(input: string, lang: "en" | "es" = "en"): MonthsResult {
  const E = MONTHS_ERRORS[lang];
  const nums = (input.match(/\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?/g) ?? []).map((s) => Math.round(Number(s.replace(/,/g, ""))));
  if (nums.length === 0) return { error: E.none };
  if (nums.length !== 12) return { error: E.count(nums.length) };
  if (nums.some((n) => n > 10000)) return { error: E.big };
  if (nums.every((n) => n === 0)) return { error: E.zero };
  return { months: nums };
}

export const average = (months: number[]) => Math.round(months.reduce((s, v) => s + v, 0) / months.length);

/** For the URL: ?m=820.700.…  (12 whole numbers, dot-separated — commas would read as thousands separators). */
export const monthsToParam = (m: number[]) => m.join(".");
export function monthsFromParam(s: string | null | undefined): number[] | null {
  if (!s) return null;
  const r = parseMonths(s.replace(/\./g, " "));
  return "months" in r ? r.months : null;
}
