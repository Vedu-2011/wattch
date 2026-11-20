import { describe, expect, it } from "vitest";
import raw from "../../data/plans.json";
import type { PlanRecord } from "@/lib/plans/schema";
import { type ClientPlan, traps } from "./rank";
import { heroStats } from "./hero";

const plans: ClientPlan[] = (raw as unknown as { plans: PlanRecord[] }).plans.map((r) => ({
  id: r.meta.id, provider: r.meta.provider, planName: r.meta.planName, rateType: r.meta.rateType, renewablePct: r.meta.renewablePct,
  rating: r.meta.rating, prepaid: r.meta.prepaid, timeOfUse: r.meta.timeOfUse, eflUrl: r.meta.eflUrl, enrollUrl: r.meta.enrollUrl,
  ptc: r.meta.ptc, status: r.check.status, via: r.read.via, fetchedAt: r.read.fetchedAt, readMs: r.read.readMs,
  message: r.check.message, rows: r.check.rows, pricing: r.pricing,
})) as ClientPlan[];

describe("home page numbers come from the data", () => {
  const s = heroStats(plans);
  it("counts match plans.json", () => {
    expect(s.total).toBe(plans.length);
    expect(s.read).toBe(plans.filter((p) => p.pricing).length);
    expect(s.withTrap).toBeGreaterThan(0);
  });
  it("every example card is a real plan with a usage trap, one per provider, worst first", () => {
    expect(s.cards.length).toBeGreaterThan(1);
    expect(new Set(s.cards.map((c) => c.provider)).size).toBe(s.cards.length);
    for (const c of s.cards) {
      const p = plans.find((x) => x.id === c.id)!;
      expect(p.planName).toBe(c.planName);
      expect(traps(p.pricing!).some((t) => t.tone === "over")).toBe(true);
      expect(c.real).toBeGreaterThan(c.sticker);
    }
    expect([...s.cards].sort((a, b) => b.over - a.over)).toEqual(s.cards);
  });
});
