import { describe, expect, it } from "vitest";
import type { PlanPricing } from "@/lib/plans/schema";
import { type ClientPlan, hasCliff, passesFilters } from "./rank";

const pricing = (over: Partial<PlanPricing> = {}): PlanPricing => ({
  baseChargeDollars: 0, energyTiers: [{ fromKwh: 0, cents: 12 }], tduCentsPerKwh: 0, tduMonthlyDollars: 0,
  credits: [], usageFees: [], amortizedFees: [], touPeriods: [], termMonths: 12,
  earlyTerminationFee: { dollars: 0, perMonthRemaining: false }, labelAvg: { k500: 0, k1000: 0, k2000: 0 }, notes: [], ...over,
});
const plan = (over: Partial<ClientPlan>, p: Partial<PlanPricing> = {}) => ({ renewablePct: 0, rating: null, pricing: pricing(p), ...over }) as ClientPlan;

describe("ranking filters", () => {
  it("a usage credit or a minimum-use fee is a cliff; an autopay credit is not", () => {
    expect(hasCliff(pricing({ credits: [{ minKwh: 1000, maxKwh: null, dollars: 125, label: "x", conditional: false }] }))).toBe(true);
    expect(hasCliff(pricing({ usageFees: [{ belowKwh: 500, dollars: 9.95, label: "x" }] as PlanPricing["usageFees"] }))).toBe(true);
    expect(hasCliff(pricing({ credits: [{ minKwh: 0, maxKwh: null, dollars: 5, label: "autopay", conditional: true }] }))).toBe(false);
  });
  it("each filter drops only what it should", () => {
    const cliff = plan({}, { credits: [{ minKwh: 1000, maxKwh: null, dollars: 125, label: "x", conditional: false }] });
    expect(passesFilters(cliff, {})).toBe(true);
    expect(passesFilters(cliff, { noCliffs: true })).toBe(false);
    expect(passesFilters(plan({ renewablePct: 49 }), { minRenewable: 50 })).toBe(false);
    expect(passesFilters(plan({ renewablePct: 100 }), { minRenewable: 50 })).toBe(true);
    expect(passesFilters(plan({ rating: null }), { minRating: 4 })).toBe(false);
    expect(passesFilters(plan({ rating: 4 }), { minRating: 4 })).toBe(true);
    expect(passesFilters(plan({}, { termMonths: 3 }), { minTermMonths: 12 })).toBe(false);
  });
});
