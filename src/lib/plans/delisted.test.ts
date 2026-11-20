import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const { clientPlans, planById, areaOf } = await import("./data");
const { DELISTED, isListed } = await import("./delisted");
const { rank, rankable, ptcTopPick } = await import("@/lib/rank");
const raw = (await import("../../../data/delisted.json")).default;

describe("plans that left Power to Choose (data/delisted.json)", () => {
  it("every id is a plan Wattch read, in the area the file says", () => {
    for (const area of ["houston", "dallas"] as const) for (const id of raw[area]) {
      expect(planById(id), id).toBeTruthy();
      expect(areaOf(id), id).toBe(area);
    }
    expect(Number.isNaN(Date.parse(DELISTED.checkedAt))).toBe(false);
  });
  for (const area of ["houston", "dallas"] as const) {
    it(`${area}: never ranked, never the state site's #1, but still have their page data`, () => {
      const plans = clientPlans(area);
      const gone = plans.filter((p) => !isListed(p.id));
      expect(gone.length).toBe(raw[area].length);
      expect(gone.every((p) => p.listed === false)).toBe(true);
      const ranked = new Set(rankable(plans).map((p) => p.id));
      expect(gone.some((p) => ranked.has(p.id))).toBe(false);
      expect(rank(plans, 1100).some((r) => !isListed(r.plan.id))).toBe(false);
      expect(isListed(ptcTopPick(plans)!.id)).toBe(true);
    });
  }
});
