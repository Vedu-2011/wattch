import texas from "../../data/seasons.json";
import houston from "../../data/seasons-houston.json";

/**
 * Houston homes don't use the same power every month: summer AC pushes August to ~1.63× the yearly average and
 * February falls to ~0.63×. Shape = ERCOT's backcasted residential load profiles for the COAST weather zone
 * (2023–2025, by calendar month), mixing its two home classes by how many CenterPoint homes ERCOT puts in each.
 * Built by scripts/houston_seasons.py. The older statewide shape (EIA-861M) stays in data/seasons.json for comparison.
 */
export const SEASON_SHAPE: readonly number[] = houston.shape;
export const SEASON_SOURCE = { name: houston.source, url: houston.url, years: houston.years, note: houston.note, weights: houston.weights };
export const TEXAS_SHAPE: readonly number[] = texas.shape;
/** Average Texas home, kWh a month (EIA-861M, metered sales ÷ customers). */
export const TEXAS_AVG_KWH = Math.round(texas.kwhPerCustomer.reduce((s, v) => s + v, 0) / 12);

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

/** Your 12 months if you average `avgKwh` a month and use power the way Houston homes do. */
export function seasonalYear(avgKwh: number): number[] {
  return SEASON_SHAPE.map((s) => Math.round(avgKwh * s));
}
