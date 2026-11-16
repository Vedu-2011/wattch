import seasons from "../../data/seasons.json";

/**
 * Texas homes don't use the same power every month: summer AC pushes August to ~1.46× the yearly average and
 * April falls to ~0.71×. Shape = EIA Form 861M Texas residential kWh per customer, each month ÷ the 12-month mean,
 * averaged over 2023–2025. Built by scripts/seasons.py from data/sources/eia861m-texas.csv.
 */
export const SEASON_SHAPE: readonly number[] = seasons.shape;
export const SEASON_SOURCE = { name: seasons.source, url: seasons.url, years: seasons.years, note: seasons.note };
/** Average Texas home, kWh a month (same EIA data). */
export const TEXAS_AVG_KWH = Math.round(seasons.kwhPerCustomer.reduce((s, v) => s + v, 0) / 12);

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

/** Your 12 months if you average `avgKwh` a month and use power the way Texas homes do. */
export function seasonalYear(avgKwh: number): number[] {
  return SEASON_SHAPE.map((s) => Math.round(avgKwh * s));
}
