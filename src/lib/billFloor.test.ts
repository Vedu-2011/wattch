import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const { clientPlans } = await import("@/lib/plans/data");
const { monthlyBill } = await import("@/lib/bill");
const { rankable } = await import("@/lib/rank");
const { MONTH_MIN } = await import("@/lib/months");
const { KWH_MAX } = await import("@/lib/params");

// Every usage a visitor can reach: one month from the 12-month box (MONTH_MIN up to 10,000) or the average box (up to KWH_MAX).
const usages = [MONTH_MIN, 60, 75, 100, 150, 200, 300, 500, 750, 999, 1000, 1001, 1500, 1999, 2000, 2001, 3000, KWH_MAX, 7500, 10000];

describe("no ranked plan ever shows a bill below $0 at a usage people can enter", () => {
  for (const area of ["houston", "dallas"] as const) {
    it(`${area}: autopay discounts counted (the worst case)`, () => {
      const bad: string[] = [];
      for (const p of rankable(clientPlans(area))) for (const k of usages) {
        const b = monthlyBill(p.pricing!, k, { includeConditional: true });
        if (!(b >= 0)) bad.push(`${p.id} @ ${k} kWh = ${b}`);
      }
      expect(bad).toEqual([]);
    });
  }
});
