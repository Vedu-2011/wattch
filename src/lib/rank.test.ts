import { describe, expect, it } from "vitest";
import type { PlanPricing } from "@/lib/plans/schema";
import { cheapestRange, type ClientPlan, ptcTopPick, rank, rankable, reveal, traps, whyLine } from "./rank";
import { SEASON_SHAPE, TEXAS_AVG_KWH, seasonalYear } from "./seasons";

const pricing = (over: Partial<PlanPricing> = {}): PlanPricing => ({
  baseChargeDollars: 0, energyTiers: [{ fromKwh: 0, cents: 10 }], tduCentsPerKwh: 6.5333, tduMonthlyDollars: 4.9,
  credits: [], usageFees: [], amortizedFees: [], touPeriods: [], termMonths: 12,
  earlyTerminationFee: { dollars: 150, perMonthRemaining: false }, labelAvg: { k500: 0, k1000: 0, k2000: 0 }, notes: [], ...over,
});
const plan = (id: string, p: PlanPricing, over: Partial<ClientPlan> = {}): ClientPlan => ({
  id, provider: `P${id}`, planName: `Plan ${id}`, rateType: "Fixed", renewablePct: 0, prepaid: false, timeOfUse: false, eflUrl: "", enrollUrl: "",
  ptc: { k500: 20, k1000: 15, k2000: 14 }, status: "verified", via: "direct", fetchedAt: "", readMs: 0, message: "", rows: [], pricing: p, ...over,
});

// AP Gas Simple Saver 3, as read from its label (verified to 19.2 / 6.2 / 12.2)
const apGas = pricing({ energyTiers: [{ fromKwh: 0, cents: 11.649 }], tduCentsPerKwh: 6.5611, credits: [{ minKwh: 1000, maxKwh: null, dollars: 125, label: "Usage credit", conditional: false }] });
const flat11 = pricing({ energyTiers: [{ fromKwh: 0, cents: 3.5 }] }); // ~10¢ all-in, like the real winner

describe("Texas seasons (EIA-861M, 2023–2025)", () => {
  it("12 months that average to 1.0", () => {
    expect(SEASON_SHAPE).toHaveLength(12);
    expect(SEASON_SHAPE.reduce((s, v) => s + v, 0) / 12).toBeCloseTo(1, 3);
  });
  it("August is about twice April (summer AC)", () => {
    expect(SEASON_SHAPE[7] / SEASON_SHAPE[3]).toBeGreaterThan(1.9);
    expect(SEASON_SHAPE[7] / SEASON_SHAPE[3]).toBeLessThan(2.2);
  });
  it("average Texas home uses about 1,117 kWh a month", () => {
    expect(TEXAS_AVG_KWH).toBe(1117);
  });
  it("a 1,100 kWh home dips under 1,000 kWh in 6 months", () => {
    expect(seasonalYear(1100).filter((m) => m < 1000)).toHaveLength(6);
  });
});

describe("ranking", () => {
  it("a credit plan that wins on a flat 1,000 kWh loses once seasons are real", () => {
    const plans = [plan("ap", apGas), plan("flat", flat11)];
    expect(rank(plans, 1000, { seasons: false })[0].plan.id).toBe("ap");
    expect(rank(plans, 1000, { seasons: true })[0].plan.id).toBe("flat");
  });
  it("yearly cost = the 12 real months added up", () => {
    const r = rank([plan("flat", flat11)], 1100)[0];
    const expected = seasonalYear(1100).reduce((s, k) => s + Math.round((k * (3.5 + 6.5333) / 100 + 4.9) * 100) / 100, 0);
    expect(r.annual).toBeCloseTo(expected, 1);
    expect(r.months).toEqual(seasonalYear(1100));
  });
  it("skips variable-rate, prepaid and unverified plans", () => {
    const plans = [plan("v", flat11, { rateType: "Variable" }), plan("pp", flat11, { prepaid: true }), plan("m", flat11, { status: "mismatch" }), plan("ok", flat11)];
    expect(rankable(plans).map((p) => p.id)).toEqual(["ok"]);
  });
  it("autopay credits count only when asked", () => {
    const auto = pricing({ credits: [{ minKwh: 0, maxKwh: null, dollars: 10, label: "Autopay", conditional: true }] });
    const p = [plan("a", auto)];
    expect(rank(p, 1000, { includeConditional: true, seasons: false })[0].annual + 120).toBeCloseTo(rank(p, 1000, { includeConditional: false, seasons: false })[0].annual, 2);
  });
  it("Power to Choose's #1 is the lowest printed price at 1,000 kWh", () => {
    expect(ptcTopPick([plan("a", flat11, { ptc: { k500: 20, k1000: 9, k2000: 12 } }), plan("b", apGas, { ptc: { k500: 19.2, k1000: 6.2, k2000: 12.2 } })])?.id).toBe("b");
  });
  it("cheapestRange finds where a plan stops winning", () => {
    const plans = [plan("ap", apGas), plan("flat", flat11)];
    const r = cheapestRange(plans, "ap", { seasons: false });
    expect(r).not.toBeNull();
    expect(r!.from).toBeGreaterThanOrEqual(1000);
  });
});

describe("the reveal", () => {
  it("says what the state site's #1 costs you a year, and why", () => {
    const plans = [plan("flat", flat11), plan("ap", apGas, { ptc: { k500: 19.2, k1000: 6.2, k2000: 12.2 } })];
    const r = reveal(plans, 1100);
    expect(r.best?.plan.id).toBe("flat");
    expect(r.pick?.plan.id).toBe("ap");
    expect(r.pickRank).toBe(2);
    expect(r.gap).toBeCloseTo(r.pick!.annual - r.best!.annual, 2);
    expect(r.gap).toBeGreaterThan(0);
    expect(r.why).toBe("Its $125 credit only kicks in at 1,000 kWh. You'd miss it 6 months a year — $750 gone.");
  });
});

describe("whyLine — every number comes from the label and the math", () => {
  it("credit you'd always get", () => {
    expect(whyLine(apGas, seasonalYear(1600))).toMatch(/you'd get it every month/);
  });
  it("credit you'd never get", () => {
    expect(whyLine(apGas, seasonalYear(500))).toMatch(/never get it/);
  });
  it("minimum-use fee months", () => {
    const p = pricing({ usageFees: [{ belowKwh: 1000, dollars: 9.95, label: "Minimum usage fee" }] });
    expect(whyLine(p, seasonalYear(1100))).toBe("It charges $10 in any month under 1,000 kWh. That's 6 months a year for you.");
  });
  it("higher price above a tier", () => {
    const p = pricing({ energyTiers: [{ fromKwh: 0, cents: 9 }, { fromKwh: 1000, cents: 14 }] });
    expect(whyLine(p, seasonalYear(1100))).toBe("Power past 1,000 kWh costs 14.0¢ instead of 9.0¢. You'd go past it 6 months a year.");
  });
  it("free-hours plans", () => {
    const p = pricing({ touPeriods: [{ label: "Nights", share: 0.43, cents: 0 }, { label: "Day", share: 0.57, cents: 18.6 }] });
    expect(whyLine(p, seasonalYear(1100))).toMatch(/assumes 43%/);
  });
  it("plain plans have nothing surprising to say", () => {
    expect(whyLine(flat11, seasonalYear(1100))).toBeNull();
  });
});

describe("traps", () => {
  it("labels a usage credit as a bill-credit cliff", () => {
    expect(traps(apGas).map((t) => t.key)).toContain("credit");
  });
  it("labels tiers, time-of-use and setup fees", () => {
    const p = pricing({ energyTiers: [{ fromKwh: 0, cents: 9 }, { fromKwh: 1000, cents: 14 }], touPeriods: [{ label: "x", share: 1, cents: 9 }], amortizedFees: [{ dollars: 50, months: 12, label: "Setup" }] });
    expect(traps(p).map((t) => t.key)).toEqual(expect.arrayContaining(["tier", "tou", "setup"]));
  });
});
