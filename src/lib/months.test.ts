import { describe, expect, it } from "vitest";
import { annualCost } from "@/lib/bill";
import type { PlanPricing } from "@/lib/plans/schema";
import { average, monthsFromParam, monthsToParam, parseMonths } from "./months";
import { rank, type ClientPlan } from "./rank";

describe("your own 12 months", () => {
  it("reads numbers split by spaces, new lines, tabs and ', '", () => {
    expect(parseMonths("820 700 760 880\n1250\t1560, 1700, 1850; 1400 1100 780 760")).toEqual({
      months: [820, 700, 760, 880, 1250, 1560, 1700, 1850, 1400, 1100, 780, 760],
    });
  });
  it("keeps a thousands comma as one number", () => {
    expect(parseMonths("820 700 760 880 1,250 1,560 1,700 1,850 1,400 1,100 780 760")).toEqual({
      months: [820, 700, 760, 880, 1250, 1560, 1700, 1850, 1400, 1100, 780, 760],
    });
  });
  it("says what's wrong in plain words", () => {
    expect(parseMonths("")).toEqual({ error: "Type 12 numbers, one for each month's kWh." });
    expect(parseMonths("100 200 300")).toEqual({ error: "That's 3 numbers. It takes 12, January to December." });
    expect(parseMonths("1 2 3 4 5 6 7 8 9 10 11 99999")).toHaveProperty("error");
  });
  it("round-trips through the URL", () => {
    const m = [820, 700, 760, 880, 1250, 1560, 1700, 1850, 1400, 1100, 780, 760];
    expect(monthsFromParam(monthsToParam(m))).toEqual(m);
    expect(average(m)).toBe(1130); // 13,560 ÷ 12
    expect(monthsFromParam("1.2.3")).toBeNull();
  });
  it("ranking uses your months: a $125 credit at 1,000 kWh pays only in your 6 months at or over 1,000", () => {
    const m = [820, 700, 760, 880, 1250, 1560, 1700, 1850, 1400, 1100, 780, 760];
    const credit: PlanPricing = {
      baseChargeDollars: 0, energyTiers: [{ fromKwh: 0, cents: 20 }], tduCentsPerKwh: 0, tduMonthlyDollars: 0,
      credits: [{ minKwh: 1000, maxKwh: null, dollars: 125, label: "c", conditional: false }], usageFees: [], amortizedFees: [],
      touPeriods: [], termMonths: 12, earlyTerminationFee: { dollars: 0, perMonthRemaining: false }, labelAvg: { k500: 0, k1000: 0, k2000: 0 }, notes: [],
    };
    const plan = { id: "c", provider: "P", planName: "C", rateType: "Fixed", prepaid: false, status: "verified", pricing: credit, ptc: { k500: 0, k1000: 0, k2000: 0 } } as ClientPlan;
    const used = m.reduce((s, v) => s + v, 0);
    expect(annualCost(credit, m)).toBe(used * 0.2 - 6 * 125);
    const r = rank([plan], 1130, { months: m })[0];
    expect(r.months).toEqual(m);
    expect(r.annual).toBe(used * 0.2 - 6 * 125);
  });
});
