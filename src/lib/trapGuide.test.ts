import { describe, expect, it } from "vitest";
import raw from "../../data/plans.json";
import type { PlanRecord } from "@/lib/plans/schema";
import type { ClientPlan } from "./rank";
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
