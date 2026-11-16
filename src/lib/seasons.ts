import texas from "../../data/seasons.json";
import houston from "../../data/seasons-houston.json";
import dallas from "../../data/seasons-dallas.json";
import type { Area } from "@/lib/plans/ptc";

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

/**
 * Dallas–Fort Worth: same method (scripts/area_seasons.py) for ERCOT's North Central weather zone, mixed by Oncor's
 * homes. More electric heat there, so January is high too (≈1.12× the average), not just August.
 */
export const DALLAS_SHAPE: readonly number[] = dallas.shape;
export const DALLAS_SOURCE = { name: dallas.source, url: dallas.url, years: dallas.years, note: dallas.note, weights: dallas.weights };
export const shapeFor = (area: Area): readonly number[] => (area === "dallas" ? DALLAS_SHAPE : SEASON_SHAPE);

/** Your 12 months if you average `avgKwh` a month and use power the way homes in that area do (Houston by default). */
export function seasonalYear(avgKwh: number, shape: readonly number[] = SEASON_SHAPE): number[] {
  return shape.map((s) => Math.round(avgKwh * s));
}
