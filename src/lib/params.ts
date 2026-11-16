import { monthsFromParam, monthsToParam } from "@/lib/months";
import type { RankOpts } from "@/lib/rank";

export type WallFilters = { locked: boolean; noCliffs: boolean; green: boolean; rated: boolean };
export const NO_FILTERS: WallFilters = { locked: false, noCliffs: false, green: false, rated: false };
/** URL keys for each filter (?lock=1 etc.) */
export const FILTER_KEYS = { locked: "lock", noCliffs: "nocliff", green: "green", rated: "rated" } as const;

/** Everything a /wall result depends on, read from URL params. Same rules for the page, the share card and metadata. */
export function parseWallParams(get: (key: string) => string | null | undefined) {
  const k = Math.round(Number(get("kwh")));
  const filters = Object.fromEntries(
    (Object.keys(FILTER_KEYS) as (keyof WallFilters)[]).map((f) => [f, get(FILTER_KEYS[f]) === "1"]),
  ) as WallFilters;
  return {
    kwh: Number.isFinite(k) && k >= 100 && k <= 5000 ? k : 1100,
    seasons: get("flat") !== "1",
    months: monthsFromParam(get("m") ?? undefined),
    filters,
    /** "Count autopay discounts" — on unless ?noauto=1 */
    withConditional: get("noauto") !== "1",
  };
}

/**
 * The query string that carries a result's bill settings to the plan, compare and wall pages
 * (usage, seasons, your own months, autopay discounts). One builder so no page drops a setting.
 */
export function billQs(o: { kwh: number; seasons: boolean; months?: number[] | null; withConditional?: boolean }): string {
  return `kwh=${o.kwh}${o.seasons ? "" : "&flat=1"}${o.months ? `&m=${monthsToParam(o.months)}` : ""}${o.withConditional === false ? "&noauto=1" : ""}`;
}

/** Every URL key a shared result depends on (share link, share card, og:image). */
export const RESULT_KEYS = ["kwh", "flat", "m", "noauto", ...Object.values(FILTER_KEYS)] as const;

export const filterOpts = (f: WallFilters): RankOpts => ({
  minTermMonths: f.locked ? 12 : 0, noCliffs: f.noCliffs, minRenewable: f.green ? 50 : 0, minRating: f.rated ? 4 : 0,
});

export const anyFilter = (f: WallFilters) => f.locked || f.noCliffs || f.green || f.rated;
