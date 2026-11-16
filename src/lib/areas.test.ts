import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { labelCheck } from "@/lib/bill";
import { billQs, parseWallParams } from "@/lib/params";
import { PlanRecord } from "@/lib/plans/schema";
import { DALLAS_SHAPE, SEASON_SHAPE, seasonalYear } from "@/lib/seasons";
import { words } from "@/lib/i18n";
import { yearFor } from "@/lib/rank";

const dallas = JSON.parse(readFileSync("data/plans-dallas.json", "utf8")) as { counts: Record<string, number>; plans: unknown[] };
const plans = dallas.plans.map((p) => PlanRecord.parse(p));

describe("Dallas–Fort Worth (Oncor) data", () => {
  it("every record fits the schema and the counts add up", () => {
    const counts = plans.reduce<Record<string, number>>((c, r) => ((c[r.check.status] = (c[r.check.status] ?? 0) + 1), c), {});
    expect(counts).toEqual(dallas.counts);
  });
  it("every verified plan rebuilds all 3 of its label's prices", () => {
    expect(plans.filter((r) => r.check.status === "verified" && !(r.pricing && labelCheck(r.pricing).ok)).map((r) => r.meta.id)).toEqual([]);
  });
  it("no plan id is in both areas", () => {
    const houston = new Set((JSON.parse(readFileSync("data/plans.json", "utf8")).plans as { meta: { id: string } }[]).map((p) => p.meta.id));
    expect(plans.filter((p) => houston.has(p.meta.id))).toEqual([]);
  });
});

describe("Dallas seasons", () => {
  it("is a real 12-month shape averaging 1, different from Houston's, with a winter bump", () => {
    expect(DALLAS_SHAPE).toHaveLength(12);
    expect(DALLAS_SHAPE.reduce((s, v) => s + v, 0) / 12).toBeCloseTo(1, 2);
    expect(DALLAS_SHAPE).not.toEqual(SEASON_SHAPE);
    expect(DALLAS_SHAPE[0]).toBeGreaterThan(1); // January above average (electric heat)
    expect(SEASON_SHAPE[0]).toBeLessThan(1);
  });
  it("yearFor picks the area's shape; Houston stays the default", () => {
    expect(yearFor(1100, true)).toEqual(seasonalYear(1100));
    expect(yearFor(1100, true, "dallas")).toEqual(seasonalYear(1100, DALLAS_SHAPE));
    expect(yearFor(1100, false, "dallas")).toEqual(Array(12).fill(1100));
  });
});

describe("area in links and words", () => {
  it("billQs only adds area for Dallas, and it round-trips", () => {
    expect(billQs({ kwh: 1100, seasons: true, area: "houston" })).toBe("kwh=1100");
    const q = new URLSearchParams(billQs({ kwh: 1100, seasons: true, area: "dallas" }));
    expect(parseWallParams((k) => q.get(k)).area).toBe("dallas");
  });
  it("billQs carries filters and Spanish so 'All plans' comes back to the same list (codex review 5)", () => {
    const filters = { locked: true, noCliffs: false, green: true, rated: false };
    const q = new URLSearchParams(billQs({ kwh: 900, seasons: true, filters, lang: "es" }));
    const back = parseWallParams((k) => q.get(k));
    expect(back.filters).toEqual(filters);
    expect(back.lang).toBe("es");
    expect(billQs({ kwh: 900, seasons: true, filters: { locked: false, noCliffs: false, green: false, rated: false } })).toBe("kwh=900");
  });
  it("Dallas words never say Houston", () => {
    const w = words("en", "dallas");
    const all = [w.wallIntro("Nov 16"), w.atUsage(1100, true, false), w.tSeasons, w.tSeasonsHint, w.shareBest, w.shareGap("$1")].join(" ");
    expect(all).not.toMatch(/Houston/);
    expect(all).toMatch(/Dallas–Fort Worth/);
    expect(words("es", "dallas").atUsage(1100, true, false)).toMatch(/Dallas–Fort Worth/);
  });
});

describe("home numbers per area", () => {
  it("Houston's home stats are unchanged by the area option; Dallas has its own", async () => {
    const { heroStats } = await import("@/lib/hero");
    const { toClientPlan } = await import("@/lib/headline");
    const h = (JSON.parse(readFileSync("data/plans.json", "utf8")).plans as unknown[]).map((p) => toClientPlan(PlanRecord.parse(p)));
    expect(heroStats(h, 1100, 5, "en", "houston")).toEqual(heroStats(h));
    const d = heroStats(plans.map(toClientPlan), 1100, 5, "en", "dallas");
    expect(d.total).toBe(172);
    expect(d.cards.length).toBeGreaterThan(0);
    for (const c of d.cards) expect(plans.some((p) => p.meta.id === c.id)).toBe(true);
  });
});

describe("Dallas records name the right utility", () => {
  it("no Dallas plan message or note says CenterPoint (codex review 7)", () => {
    for (const p of plans) {
      expect(p.check.message).not.toMatch(/CenterPoint/);
      for (const n of p.pricing?.notes ?? []) expect(n).not.toMatch(/CenterPoint/);
    }
    expect(plans.some((p) => /with Oncor.s, all 3 averages match/.test(p.check.message))).toBe(true);
  });
});
