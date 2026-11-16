import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { clientPlans } = await import("@/lib/plans/data");
const { yearFor } = await import("./rank");
const { annualCost } = await import("./bill");
const { compareYear } = await import("./compare");

// The compare page must never disagree with the results page: same plans, same year → same dollars.
// And the 12 rows people read (rounded to cents) must add up to the total printed above them.
describe("compare page numbers on real plans", () => {
  for (const area of ["houston", "dallas"] as const) {
    it(area, () => {
      const plans = clientPlans(area).filter((p) => p.pricing);
      const months = yearFor(1100, true, area);
      // every 7th plan against every 11th: a wide spread without 20,000 pairs
      for (let i = 0; i < plans.length; i += 7) {
        const a = plans[i], b = plans[(i * 11 + 3) % plans.length];
        const c = compareYear(a.pricing!, b.pricing!, months);
        expect(c.totalA, `${a.id} total`).toBeCloseTo(annualCost(a.pricing!, months), 2);
        expect(c.totalB, `${b.id} total`).toBeCloseTo(annualCost(b.pricing!, months), 2);
        const shownA = c.rows.reduce((s, r) => s + Number(r.a.toFixed(2)), 0);
        const shownB = c.rows.reduce((s, r) => s + Number(r.b.toFixed(2)), 0);
        expect(Math.abs(shownA - c.totalA), `${a.id} rows add up`).toBeLessThan(0.07); // 12 roundings of ≤ half a cent
        expect(Math.abs(shownB - c.totalB), `${b.id} rows add up`).toBeLessThan(0.07);
        expect(c.winsA + c.winsB + c.rows.filter((r) => r.cheaper === "tie").length).toBe(12);
      }
    });
  }

  it("the demo pair matches the results page ($1,334 vs $1,712, $378 apart)", () => {
    const plans = clientPlans("houston");
    const best = plans.find((p) => p.id === "37797")!, pick = plans.find((p) => p.id === "33633")!;
    const c = compareYear(best.pricing!, pick.pricing!, yearFor(1100, true, "houston"));
    expect(Math.round(c.totalA)).toBe(1334);
    expect(Math.round(c.totalB)).toBe(1712);
    expect(Math.round(c.diff)).toBe(378);
  });
});

describe("notFirm (compare pages and cards only promise a yearly number for ranked plans)", () => {
  it("variable, not-verified and normal plans", async () => {
    const { planById } = await import("@/lib/plans/data");
    const { notFirm } = await import("@/lib/compare");
    expect(notFirm(planById("24977")!)).toBe("variable");
    expect(notFirm(planById("33670")!)).toBe("unverified");
    expect(notFirm(planById("33633")!)).toBeNull();
  });
});

describe("notFirm and the ranking use the same rule", () => {
  it("every plan in both areas: no reason ⇔ ranked", async () => {
    const { planById } = await import("@/lib/plans/data");
    const { notFirm } = await import("@/lib/compare");
    const { rankable } = await import("./rank");
    for (const area of ["houston", "dallas"] as const) {
      const ranked = new Set(rankable(clientPlans(area)).map((p) => p.id));
      for (const p of clientPlans(area)) expect(notFirm(planById(p.id)!) === null, `${area} ${p.id}`).toBe(ranked.has(p.id));
    }
  });
});
