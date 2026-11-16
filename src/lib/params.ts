import { type Lang, asLang } from "@/lib/i18n";
import { type Area, asArea } from "@/lib/plans/ptc";
import { monthsFromParam, monthsToParam } from "@/lib/months";
import type { RankOpts } from "@/lib/rank";

export type WallFilters = { locked: boolean; noCliffs: boolean; green: boolean; rated: boolean };
export const NO_FILTERS: WallFilters = { locked: false, noCliffs: false, green: false, rated: false };
/** URL keys for each filter (?lock=1 etc.) */
export const FILTER_KEYS = { locked: "lock", noCliffs: "nocliff", green: "green", rated: "rated" } as const;

/** Everything a /wall result depends on, read from URL params. Same rules for the page, the share card and metadata. */
export const KWH_MIN = 100, KWH_MAX = 5000, KWH_DEFAULT = 1100;

/**
 * Usage from the URL. Out-of-range numbers are pulled to the nearest limit; anything that isn't a number becomes
 * the average home. `note` says which, so the page can tell the visitor instead of silently changing it.
 */
export function readKwh(raw: string | null | undefined): { kwh: number; note: null | "low" | "high" | "bad" } {
  if (raw == null || raw === "") return { kwh: KWH_DEFAULT, note: null };
  const k = Math.round(Number(raw));
  if (!Number.isFinite(k)) return { kwh: KWH_DEFAULT, note: "bad" };
  if (k < KWH_MIN) return { kwh: KWH_MIN, note: "low" };
  if (k > KWH_MAX) return { kwh: KWH_MAX, note: "high" };
  return { kwh: k, note: null };
}

export function parseWallParams(get: (key: string) => string | null | undefined) {
  const usage = readKwh(get("kwh"));
  const filters = Object.fromEntries(
    (Object.keys(FILTER_KEYS) as (keyof WallFilters)[]).map((f) => [f, get(FILTER_KEYS[f]) === "1"]),
  ) as WallFilters;
  return {
    kwh: usage.kwh,
    /** set when the URL's usage couldn't be used as-is (see readKwh) */
    kwhNote: usage.note,
    seasons: get("flat") !== "1",
    months: monthsFromParam(get("m") ?? undefined),
    filters,
    /** "Count autopay discounts" — on unless ?noauto=1 */
    withConditional: get("noauto") !== "1",
    /** ?lang=es shows the wall in Spanish */
    lang: asLang(get("lang")),
    /** ?area=dallas reads Dallas–Fort Worth (Oncor) plans with that area's seasons */
    area: asArea(get("area")),
  };
}

/**
 * The query string that carries a result's bill settings to the plan, compare and wall pages
 * (usage, seasons, your own months, autopay discounts). One builder so no page drops a setting.
 */
export function billQs(o: { kwh: number; seasons: boolean; months?: number[] | null; withConditional?: boolean; area?: Area; filters?: WallFilters; lang?: Lang }): string {
  // filters and language don't change a bill, but they ride along so "All plans" returns to the same list
  const f = o.filters ? (Object.keys(FILTER_KEYS) as (keyof WallFilters)[]).filter((k) => o.filters![k]).map((k) => `&${FILTER_KEYS[k]}=1`).join("") : "";
  return `kwh=${o.kwh}${o.seasons ? "" : "&flat=1"}${o.months ? `&m=${monthsToParam(o.months)}` : ""}${o.withConditional === false ? "&noauto=1" : ""}${o.area && o.area !== "houston" ? `&area=${o.area}` : ""}${f}${o.lang === "es" ? "&lang=es" : ""}`;
}

/** Every URL key a shared result depends on (share link, share card, og:image). */
export const RESULT_KEYS = ["kwh", "flat", "m", "noauto", "lang", "area", ...Object.values(FILTER_KEYS)] as const;

export const filterOpts = (f: WallFilters): RankOpts => ({
  minTermMonths: f.locked ? 12 : 0, noCliffs: f.noCliffs, minRenewable: f.green ? 50 : 0, minRating: f.rated ? 4 : 0,
});

export const anyFilter = (f: WallFilters) => f.locked || f.noCliffs || f.green || f.rated;
