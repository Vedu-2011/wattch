import { describe, expect, it } from "vitest";
import type { PlanPricing } from "@/lib/plans/schema";
import { compareYear } from "./compare";

const p = (cents: number, credit?: { minKwh: number; dollars: number }): PlanPricing => ({
  baseChargeDollars: 0, energyTiers: [{ fromKwh: 0, cents }], tduCentsPerKwh: 0, tduMonthlyDollars: 0,
  credits: credit ? [{ ...credit, maxKwh: null, label: "credit", conditional: false }] : [], usageFees: [], amortizedFees: [],
  touPeriods: [], termMonths: 12, earlyTerminationFee: { dollars: 0, perMonthRemaining: false }, labelAvg: { k500: 0, k1000: 0, k2000: 0 }, notes: [],
});

describe("compare two plans month by month", () => {
  const months = [800, 700, 750, 850, 1200, 1500, 1650, 1800, 1400, 1100, 750, 720];
  it("flat 12¢ vs 20¢ with a $125 credit at 1,000 kWh: the credit plan wins only its credit months", () => {
    const c = compareYear(p(12), p(20, { minKwh: 1000, dollars: 125 }), months);
    // month with 1,200 kWh: A = $144, B = $240 − $125 = $115 → B cheaper
    expect(c.rows[4]).toEqual({ kwh: 1200, a: 144, b: 115, cheaper: "b" });
    // month with 800 kWh: A = $96, B = $160 → A cheaper
    expect(c.rows[0]).toEqual({ kwh: 800, a: 96, b: 160, cheaper: "a" });
    // B wins when 0.20k − 125 < 0.12k → k < 1,562.5: the 1,100 1,200 1,400 1,500 months (not 1,650 or 1,800)
    expect(c.winsB).toBe(4);
    expect(c.totalA).toBe(Math.round(months.reduce((s, m) => s + m * 0.12, 0) * 100) / 100);
    expect(c.diff).toBe(Math.round((c.totalB - c.totalA) * 100) / 100);
    expect(c.cliffsB.map((x) => x.kwh)).toEqual([1000]);
    expect(c.cliffsA).toEqual([]);
  });
});
