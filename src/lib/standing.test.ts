import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { clientPlans } = await import("@/lib/plans/data");
const { reveal, standing } = await import("./rank");

// The plan share card (standing) must agree with the results page (reveal) about the same plan.
describe("standing = what the results page says", () => {
  for (const area of ["houston", "dallas"] as const) {
    it(area, () => {
      const plans = clientPlans(area);
      for (const kwh of [600, 1100, 2000]) {
        const r = reveal(plans, kwh, { area });
        if (!r.pick || !r.best) continue;
        const s = standing(plans, r.pick.plan.id, kwh, { area })!;
        expect(s.position, `${area} ${kwh} rank`).toBe(r.pickRank);
        expect(s.of).toBe(r.ranked.length);
        expect(s.gap).toBeCloseTo(r.gap, 2);
        expect(standing(plans, r.best.plan.id, kwh, { area })!.position).toBe(1);
      }
    });
  }
  it("the demo numbers: #74 of 154, $378 (Houston), #91 of 137, $530 (Dallas)", () => {
    const h = reveal(clientPlans("houston"), 1100, { area: "houston" }), d = reveal(clientPlans("dallas"), 1100, { area: "dallas" });
    const hs = standing(clientPlans("houston"), h.pick!.plan.id, 1100, { area: "houston" })!;
    const ds = standing(clientPlans("dallas"), d.pick!.plan.id, 1100, { area: "dallas" })!;
    expect([hs.position, hs.of, Math.round(hs.gap)]).toEqual([74, 154, 378]);
    expect([ds.position, ds.of, Math.round(ds.gap)]).toEqual([91, 137, 530]);
  });
  it("unranked or unknown plans → null (the card falls back to the general one)", () => {
    expect(standing(clientPlans("houston"), "nope", 1100)).toBeNull();
  });
});
