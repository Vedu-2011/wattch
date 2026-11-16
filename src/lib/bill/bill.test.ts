import { describe, expect, it } from "vitest";
import type { PlanPricing } from "@/lib/plans/schema";
import { annualCost, avgCents, findCliffs, flatYear, labelCheck, monthlyBill } from ".";

const base: PlanPricing = {
  baseChargeDollars: 0, energyTiers: [{ fromKwh: 0, cents: 10 }], tduCentsPerKwh: 6.533, tduMonthlyDollars: 4.9,
  credits: [], usageFees: [], amortizedFees: [], touPeriods: [], termMonths: 12,
  earlyTerminationFee: { dollars: 150, perMonthRemaining: false }, labelAvg: { k500: 0, k1000: 0, k2000: 0 }, notes: [],
};

describe("real EFLs (hand-checked, Nov 15 2026)", () => {
  it("Champion Free Weekends-24: 70/30 weekday/weekend split matches 14.0 / 13.5 / 13.2", () => {
    const p: PlanPricing = { ...base, energyTiers: [{ fromKwh: 0, cents: 9.2 }],
      touPeriods: [{ label: "Weekdays", share: 0.7, cents: 9.2 }, { label: "Weekends", share: 0.3, cents: 0 }],
      labelAvg: { k500: 14.0, k1000: 13.5, k2000: 13.2 } };
    expect(monthlyBill(p, 1000)).toBe(134.63);
    expect(labelCheck(p).ok).toBe(true);
  });
  it("Octopus Simple 12: $5 autopay credit is inside the 11.8 average", () => {
    const p: PlanPricing = { ...base, energyTiers: [{ fromKwh: 0, cents: 5.3192 }], tduCentsPerKwh: 6.5333,
      credits: [{ minKwh: 0, maxKwh: null, dollars: 5, label: "Autopay discount", conditional: true }],
      labelAvg: { k500: 11.8, k1000: 11.8, k2000: 11.8 } };
    expect(labelCheck(p).ok).toBe(true);
    expect(monthlyBill(p, 500, { includeConditional: false })).toBe(64.16);
  });
});

describe("bill math", () => {
  it("energy blocks charge each block at its own rate", () => {
    const p = { ...base, tduCentsPerKwh: 0, tduMonthlyDollars: 0, energyTiers: [{ fromKwh: 0, cents: 10 }, { fromKwh: 1000, cents: 20 }] };
    expect(monthlyBill(p, 1500)).toBe(200);
  });
  it("a usage credit makes a cliff one kWh below the line", () => {
    const p = { ...base, credits: [{ minKwh: 1000, maxKwh: null, dollars: 100, label: "Usage credit", conditional: false }] };
    expect(monthlyBill(p, 999) - monthlyBill(p, 1000)).toBeGreaterThan(99);
    expect(findCliffs(p)).toEqual([{ kwh: 1000, below: monthlyBill(p, 999), at: monthlyBill(p, 1000) }]);
  });
  it("a credit with an upper limit makes a second cliff above it", () => {
    const p = { ...base, credits: [{ minKwh: 1000, maxKwh: 2000, dollars: 50, label: "Usage credit", conditional: false }] };
    expect(findCliffs(p).map((c) => c.kwh)).toEqual([1000, 2001]);
  });
  it("minimum usage fee applies only below the line", () => {
    const p = { ...base, usageFees: [{ belowKwh: 1000, dollars: 9.95, label: "Minimum usage fee" }] };
    expect(monthlyBill(p, 999) - monthlyBill(p, 1000)).toBeCloseTo(9.95 - 0.16533, 2);
  });
  it("label check fails when the reader got a number wrong", () => {
    const p = { ...base, labelAvg: { k500: 25.0, k1000: 24.0, k2000: 23.0 } };
    const r = labelCheck(p);
    expect(r.ok).toBe(false);
    expect(r.rows.every((x) => !x.ok)).toBe(true);
  });
  it("avg cents rounds to one decimal and annual cost sums 12 months", () => {
    expect(avgCents(base, 1000)).toBe(17);
    expect(annualCost(base, flatYear(1000))).toBeCloseTo(12 * monthlyBill(base, 1000), 2);
  });
});
