import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { explainBill } from "@/lib/bill/explain";
import { toClientPlan } from "@/lib/headline";
import { words } from "@/lib/i18n";
import { filterOpts, parseWallParams, readKwh } from "@/lib/params";
import { PlanRecord } from "@/lib/plans/schema";
import { rank, reveal, whyLine } from "@/lib/rank";

const plans = (JSON.parse(readFileSync("data/plans.json", "utf8")).plans as unknown[]).map((p) => toClientPlan(PlanRecord.parse(p)));
/** true if any number anywhere in the value is NaN or ±Infinity, or any text says so */
const broken = (v: unknown) => /NaN|Infinity/.test(JSON.stringify(v, (_, x) => (typeof x === "number" && !Number.isFinite(x) ? "NaN" : x)));
const fromUrl = (q: string) => { const u = new URLSearchParams(q); return parseWallParams((k) => u.get(k)); };

describe("odd usage in the URL", () => {
  it("clamps out-of-range numbers and says so; non-numbers become the average home", () => {
    expect(readKwh("0")).toEqual({ kwh: 100, note: "low" });
    expect(readKwh("50")).toEqual({ kwh: 100, note: "low" });
    expect(readKwh("-300")).toEqual({ kwh: 100, note: "low" });
    expect(readKwh("5000")).toEqual({ kwh: 5000, note: null });
    expect(readKwh("99999")).toEqual({ kwh: 5000, note: "high" });
    expect(readKwh("abc")).toEqual({ kwh: 1100, note: "bad" });
    expect(readKwh("Infinity")).toEqual({ kwh: 1100, note: "bad" });
    expect(readKwh(undefined)).toEqual({ kwh: 1100, note: null });
    expect(readKwh("")).toEqual({ kwh: 1100, note: null });
  });
  it("the note is plain words in both languages", () => {
    for (const lang of ["en", "es"] as const) for (const note of ["low", "high", "bad"] as const) {
      const t = words(lang).kwhNote(note, note === "high" ? 5000 : note === "low" ? 100 : 1100);
      expect(t).toMatch(/\d/);
      expect(t).not.toMatch(/NaN|undefined|null/);
    }
  });
});

describe("no NaN or Infinity anywhere", () => {
  it("every usage from 100 to 5,000 kWh, seasons on and off, every filter on", () => {
    for (const q of ["kwh=100", "kwh=5000", "kwh=0", "kwh=abc", "kwh=1100&flat=1", "kwh=100&lock=1&nocliff=1&green=1&rated=1", "kwh=5000&lock=1&nocliff=1&green=1&rated=1"]) {
      const p = fromUrl(q);
      const r = reveal(plans, p.kwh, { seasons: p.seasons, months: p.months, includeConditional: p.withConditional, ...filterOpts(p.filters) });
      expect(broken({ gap: r.gap, rank: r.pickRank, why: r.why, top: r.ranked.slice(0, 3).map((x) => [x.annual, x.avgCents, x.monthly]) }), q).toBe(false);
      for (const x of r.ranked.slice(0, 5)) expect(broken(explainBill(x.plan.pricing!, p.kwh)), q).toBe(false);
    }
  });
  it("every filter at once still leaves an honest answer (or the friendly empty message)", () => {
    const r = reveal(plans, 1100, { seasons: true, ...filterOpts({ locked: true, noCliffs: true, green: true, rated: true }) });
    expect(r.ranked.length).toBeGreaterThanOrEqual(0);
    if (r.ranked.length === 0) expect(words("en").noneTitle).toMatch(/No plan/);
    else expect(r.gap).toBeGreaterThanOrEqual(0);
  });
  it("12 months of zero can't make a NaN or −∞ price (the URL and form already refuse them)", () => {
    const zero = Array(12).fill(0);
    const r = rank(plans, 1100, { months: zero });
    expect(broken(r.map((x) => [x.avgCents, x.annual]))).toBe(false);
    expect(fromUrl("kwh=1100&m=0.0.0.0.0.0.0.0.0.0.0.0").months).toBeNull();
    expect(broken(whyLine(r[0].plan.pricing!, zero))).toBe(false);
  });
});
