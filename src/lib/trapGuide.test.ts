import { describe, expect, it } from "vitest";
import raw from "../../data/plans.json";
import { readFileSync } from "node:fs";
import { toClientPlan } from "@/lib/headline";
import { PlanRecord } from "@/lib/plans/schema";
import { type ClientPlan, rank } from "./rank";
import { GUIDE_USAGES, TRAP_KINDS, trapGuide } from "./trapGuide";

const plans = (raw as unknown as { plans: PlanRecord[] }).plans.map((r) => ({
  id: r.meta.id, provider: r.meta.provider, planName: r.meta.planName, rateType: r.meta.rateType, renewablePct: r.meta.renewablePct,
  rating: r.meta.rating, prepaid: r.meta.prepaid, ptc: r.meta.ptc, status: r.check.status, pricing: r.pricing,
})) as ClientPlan[];

describe("trap encyclopedia", () => {
  const g = trapGuide(plans);
  it("has every kind, and each example is a real plan that has that trap", () => {
    expect(g.map((e) => e.key)).toEqual(TRAP_KINDS.map((t) => t.key));
    for (const e of g) {
      if (!e.example) { expect(e.count).toBe(0); continue; }
      const p = plans.find((x) => x.id === e.example!.id)!;
      expect(p.planName).toBe(e.example.planName);
      expect(e.test(p.pricing!)).toBe(true);
      expect(e.example.at.map((a) => a.kwh)).toEqual([...GUIDE_USAGES]);
      for (const a of e.example.at) { expect(a.extra).toBeGreaterThanOrEqual(0); expect(a.rank).toBeLessThanOrEqual(a.of); }
    }
  });
  it("the bill-credit cliff exists in today's data and costs more at 1,100 kWh than its sticker suggests", () => {
    const c = g.find((e) => e.key === "credit")!;
    expect(c.count).toBeGreaterThan(0);
    expect(c.example!.at[1].extra).toBeGreaterThan(0);
  });
});

describe("trap guide per area", () => {
  const load = (f: string) => (JSON.parse(readFileSync(f, "utf8")).plans as unknown[]).map((p) => toClientPlan(PlanRecord.parse(p)));
  it("Houston is the default, so the old page is unchanged", () => {
    const h = load("data/plans.json");
    expect(trapGuide(h, "houston")).toEqual(trapGuide(h));
  });
  it("Dallas uses Dallas plans and Dallas seasons: examples are Oncor plans, priced differently from a Houston year", () => {
    const d = load("data/plans-dallas.json");
    const g = trapGuide(d, "dallas");
    const ids = new Set(d.map((p) => p.id));
    for (const e of g) if (e.example) expect(ids.has(e.example.id)).toBe(true);
    const credit = g.find((e) => e.key === "credit")!;
    expect(credit.count).toBeGreaterThan(0);
    // the 1,100 kWh price is the Dallas-seasons yearly cost of that plan, not the Houston one
    const id = credit.example!.id;
    const at1100 = credit.example!.at.find((a) => a.kwh === 1100)!.annual;
    expect(at1100).toBe(rank(d, 1100, { area: "dallas" }).find((r) => r.plan.id === id)!.annual);
    expect(at1100).not.toBe(rank(d, 1100, { area: "houston" }).find((r) => r.plan.id === id)!.annual);
  });
});
