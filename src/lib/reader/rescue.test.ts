import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { labelCheck, monthlyBill } from "@/lib/bill";
import type { PlanRecord } from "@/lib/plans/schema";
import { fillTdu, grounded } from "./parse";
import { rescue, slipFixes, tduCandidates, textSha, type ManualRead } from "./rescue";
import { ptcAveragesOnLabel, readSoFedForm } from "./templates";

// frozen copies of real labels (Nov 15 2026): data/text changes every time a label is re-fetched
const text = (id: string) => readFileSync(`test-data/labels/${id}.txt`, "utf8");
const manual = (id: string) => JSON.parse(readFileSync(`data/manual/${id}.json`, "utf8")) as ManualRead;
const CNP = [{ cents: 6.5333, monthly: 4.9 }, { cents: 6.5611, monthly: 4.9 }];

describe("form-field reader (Ranchero / Southern Federal labels, real text)", () => {
  it("Ranchero Cheapskate - 3: 4.2047¢ energy, $4.95 base, 3 months, $179 fee → matches 12.7 / 11.7 / 11.2 with CenterPoint delivery", () => {
    const p = readSoFedForm(text("29273"), { k500: 12.7, k1000: 11.7, k2000: 11.2 })!;
    expect(p.energyTiers).toEqual([{ fromKwh: 0, cents: 4.2047 }]);
    expect([p.baseChargeDollars, p.termMonths, p.earlyTerminationFee.dollars]).toEqual([4.95, 3, 179]);
    expect(labelCheck(p).ok).toBe(false); // no delivery printed yet
    const f = fillTdu(p, CNP)!;
    expect(f.pricing.tduCentsPerKwh).toBe(6.5333);
    expect(f.rows.map((r) => r.ours)).toEqual([12.7, 11.7, 11.2]);
  });
  it("SoFed Better Rate - 36: the $249 fee stops before the glued date 11052026", () => {
    const p = readSoFedForm(text("29342"), { k500: 13.8, k1000: 12.8, k2000: 12.4 })!;
    expect(p.earlyTerminationFee.dollars).toBe(249);
    expect(p.termMonths).toBe(36);
  });
  it("SoFed Digital Saver Plus - 12: '13' (not 13.0) and a $0 base charge", () => {
    const p = readSoFedForm(text("29296"), { k500: 13, k1000: 12.6, k2000: 12.3 })!;
    expect(p.baseChargeDollars).toBe(0);
    expect(p.energyTiers[0].cents).toBe(5.5272);
    expect(fillTdu(p, CNP)).not.toBeNull();
  });
  it("needs Power to Choose's exact numbers to split the fields; wrong numbers → no read", () => {
    expect(readSoFedForm(text("29273"), { k500: 12.7, k1000: 11.8, k2000: 11.2 })).toBeNull();
    expect(readSoFedForm(text("33633"), { k500: 19.2, k1000: 6.2, k2000: 12.2 })).toBeNull();
  });
});

describe("averages cross-check", () => {
  it("AP Gas Simple Saver 3: the label prints 19.2 / 6.2 / 12.2 (the reader took 7.2 from '37.2 %')", () => {
    const ptc = { k500: 19.2, k1000: 6.2, k2000: 12.2 };
    expect(ptcAveragesOnLabel(text("33633"), ptc)).toBe(true);
    expect(ptcAveragesOnLabel(text("33633"), { ...ptc, k1000: 7.3 })).toBe(false);
  });
  it("the $125 credit at ≥1,000 kWh makes 1,000 kWh cheaper than 500 kWh", () => {
    const rec = { meta: { ptc: { k500: 19.2, k1000: 6.2, k2000: 12.2 } }, read: { parsedBy: "claude-haiku-5-5", sha256: "x" },
      pricing: { baseChargeDollars: 0, energyTiers: [{ fromKwh: 0, cents: 11.649 }], tduCentsPerKwh: 6.5611, tduMonthlyDollars: 4.9,
        credits: [{ minKwh: 1000, maxKwh: null, dollars: 125, label: "Usage credit", conditional: false }], usageFees: [], amortizedFees: [], touPeriods: [],
        termMonths: 3, earlyTerminationFee: { dollars: 150, perMonthRemaining: false }, labelAvg: { k500: 19.2, k1000: 7.2, k2000: 12.2 }, notes: [] },
      check: { status: "mismatch", rows: [], message: "" } } as unknown as PlanRecord;
    const fix = rescue(rec, text("33633"), CNP)!;
    expect(fix.rows.map((r) => r.ours)).toEqual([19.2, 6.2, 12.2]);
    expect(monthlyBill(fix.pricing, 999) - monthlyBill(fix.pricing, 1000)).toBeGreaterThan(124);
  });
});

describe("hand-reads in data/manual are still checked by code", () => {
  for (const f of readdirSync("data/manual")) {
    const m = manual(f.replace(".json", ""));
    it(`${m.plan}: averages on the label and rebuilt to ±0.1¢`, () => {
      expect(grounded(text(m.id), m.pricing)).toBe(true);
      const ok = labelCheck(m.pricing).ok || fillTdu(m.pricing, CNP) !== null;
      expect(ok).toBe(true);
    });
  }
  it("TXU Free Nights & Cool Summer: the 25% summer bonus is needed to hit 18.0¢", () => {
    const p = fillTdu(manual("36599").pricing, CNP)!.pricing;
    expect(labelCheck(p).ok).toBe(true);
    const noBonus = { ...p, touPeriods: p.touPeriods.filter((t) => t.cents >= 0) };
    expect(labelCheck(noBonus).ok).toBe(false);
    expect(fillTdu({ ...noBonus, tduCentsPerKwh: 0, tduMonthlyDollars: 0 }, CNP)).toBeNull();
  });
  it("Texans Choice Instant 12: $130 even at 500 kWh, energy only above 1,000", () => {
    const p = manual("35975").pricing;
    expect(monthlyBill(p, 500)).toBe(130);
    expect(monthlyBill(p, 2000)).toBe(270);
  });
  it("Tara Balanced Days: 33% of use in Day Hours at 0¢ energy", () => {
    expect(monthlyBill(manual("17267").pricing, 1000)).toBe(103.49);
  });
  it("a hand-read only applies to the exact label text it was read from", () => {
    const m = manual("35975");
    const rec = { meta: { ptc: { k500: 26, k1000: 13, k2000: 13.5 } }, read: { parsedBy: "x", sha256: "x" }, pricing: null,
      check: { status: "mismatch", rows: [], message: "" } } as unknown as PlanRecord;
    expect(m.textSha256).toBe(textSha(text("35975")));
    expect(rescue(rec, text("35975"), CNP, m)).not.toBeNull();
    expect(rescue(rec, text("35975") + "\nUpdated label: energy charge 15.00¢", CNP, m)).toBeNull();
  });
});

describe("small reader slips fixed by code (Nov 15 re-read)", () => {
  const base = {
    baseChargeDollars: 0, energyTiers: [{ fromKwh: 0, cents: 11.09 }], tduCentsPerKwh: 6.5333, tduMonthlyDollars: 4.9,
    credits: [], usageFees: [], amortizedFees: [], touPeriods: [], termMonths: 12,
    earlyTerminationFee: { dollars: 100, perMonthRemaining: false }, labelAvg: { k500: 18.6, k1000: 8.1, k2000: 12.9 }, notes: [],
  };
  it("Spark Sure Saver 12: a $100 credit read as starting at 1,000.01 kWh → label's 8.1¢ at 1,000 needs it at 1,000", () => {
    const p = { ...base, credits: [{ minKwh: 1000.01, maxKwh: null, dollars: 100, label: "credit", conditional: false }] };
    expect(labelCheck(p).ok).toBe(false);
    const fixes = slipFixes(p);
    expect(fixes).toHaveLength(1);
    expect(fixes[0].pricing.credits[0].minKwh).toBe(1000);
    expect(labelCheck(fixes[0].pricing).rows.map((r) => r.ours)).toEqual([18.6, 8.1, 12.9]);
  });
  it("Just Energy Days Bundle: 'Day Hours credited back' read as −4.1¢ → 0¢ rebuilds 11.1 / 10.2 / 9.8", () => {
    const p = {
      ...base, energyTiers: [{ fromKwh: 0, cents: 4.1 }], tduCentsPerKwh: 6.5611, termMonths: 3,
      amortizedFees: [{ dollars: 49.99, months: 12, label: "setup" }],
      touPeriods: [{ label: "Day Hours credit", share: 0.33, cents: -4.1 }, { label: "other", share: 0.67, cents: 4.1 }],
      labelAvg: { k500: 11.1, k1000: 10.2, k2000: 9.8 },
    };
    expect(labelCheck(p).ok).toBe(false);
    const [fix] = slipFixes(p);
    expect(fix.pricing.touPeriods[0].cents).toBe(0);
    expect(labelCheck(fix.pricing).ok).toBe(true);
  });
  it("leaves real bonus credits alone (TXU's −4.65¢ isn't the negative of another period's price)", () => {
    const p = { ...base, touPeriods: [{ label: "night bonus", share: 0.1, cents: -4.65 }, { label: "all", share: 0.9, cents: 18.6 }] };
    expect(slipFixes(p)).toEqual([]);
  });
  it("rescue only keeps a fix when the label check passes", () => {
    const p = { ...base, credits: [{ minKwh: 1000.01, maxKwh: null, dollars: 5, label: "credit", conditional: false }] };
    const rec = { meta: { ptc: { k500: 0, k1000: 0, k2000: 0 } }, read: { parsedBy: "x" }, pricing: p,
      check: { status: "mismatch", rows: [], message: "" } } as unknown as PlanRecord;
    expect(rescue(rec, "", [])).toBeNull();
  });
});

describe("averages must sit in the price row", () => {
  const ptc = { k500: 19.2, k1000: 6.2, k2000: 12.2 };
  it("accepts a row of three prices", () => {
    expect(ptcAveragesOnLabel("Average price per kWh 19.2¢ 6.2¢ 12.2¢", ptc)).toBe(true);
  });
  it("accepts a price printed with two decimals (Express: '20.6¢ 7.60¢ 13.7¢')", () => {
    expect(ptcAveragesOnLabel(text("36619"), { k500: 20.6, k1000: 7.6, k2000: 13.7 })).toBe(true);
  });
  it("Express Flash Value 12: right read, delivery 'passed through as billed' → CenterPoint's charges make all 3 match", () => {
    const pricing = {
      baseChargeDollars: 0, energyTiers: [{ fromKwh: 0, cents: 13.097 }], tduCentsPerKwh: 0, tduMonthlyDollars: 0,
      credits: [{ minKwh: 999, maxKwh: null, dollars: 125, label: "Monthly Bill Credit", conditional: false }],
      usageFees: [], amortizedFees: [], touPeriods: [], termMonths: 12, earlyTerminationFee: { dollars: 20, perMonthRemaining: true },
      labelAvg: { k500: 20.6, k1000: 7.6, k2000: 13.7 }, notes: [],
    };
    const rec = { meta: { ptc: { k500: 20.6, k1000: 7.6, k2000: 13.7 } }, read: { parsedBy: "claude-haiku-5-5" }, pricing,
      check: { status: "mismatch", rows: [], message: "" } } as unknown as PlanRecord;
    const fix = rescue(rec, text("36619"), CNP)!;
    expect(fix.tduFilled).toBe(true);
    expect(fix.rows.every((r) => r.ok)).toBe(true);
    expect(fix.rows.map((r) => r.ours).slice(0, 2)).toEqual([20.6, 7.6]);
  });
  it("rejects the same numbers scattered around the label", () => {
    expect(ptcAveragesOnLabel("Renewable 19.2 ¢ … deposit 6.2 ¢ … late fee 12.2 ¢", ptc)).toBe(false);
  });
  it("rejects a number that's only part of a bigger one", () => {
    expect(ptcAveragesOnLabel("119.2¢ 6.2¢ 12.2¢", ptc)).toBe(false);
  });
});

describe("grounded()", () => {
  const p = (k500: number, k1000: number, k2000: number) => ({ ...manual("35975").pricing, labelAvg: { k500, k1000, k2000 } });
  it("accepts numbers printed on the label, in 13.0 or 13 form", () => {
    expect(grounded("Average 26.0¢ 13.0¢ 13.5¢", p(26, 13, 13.5))).toBe(true);
  });
  it("rejects a number that only appears inside a bigger one (7.2 inside 37.2)", () => {
    expect(grounded("19.2 ¢ ... 37.2 % ... 12.2 ¢", p(19.2, 7.2, 12.2))).toBe(false);
  });
  it("rejects zeros (label averages not readable)", () => {
    expect(grounded("0 0 0", p(0, 0, 0))).toBe(false);
  });
});

describe("fillTdu()", () => {
  const noTdu = readSoFedForm(text("29273"), { k500: 12.7, k1000: 11.7, k2000: 11.2 })!;
  it("tries candidates in order and keeps the first that matches all 3", () => {
    const f = fillTdu(noTdu, [{ cents: 9, monthly: 9 }, ...CNP])!;
    expect([f.pricing.tduCentsPerKwh, f.pricing.tduMonthlyDollars]).toEqual([6.5333, 4.9]);
  });
  it("never touches a label that printed its own delivery charges", () => {
    expect(fillTdu({ ...noTdu, tduCentsPerKwh: 1, tduMonthlyDollars: 0 }, CNP)).toBeNull();
  });
  it("gives up when no candidate rebuilds the label", () => {
    expect(fillTdu(noTdu, [{ cents: 9, monthly: 9 }])).toBeNull();
  });
});

describe("tduCandidates()", () => {
  it("picks the most common printed CenterPoint charges and skips filled ones", () => {
    const r = (cents: number, monthly: number, filled = false) => ({ check: { status: "verified", tduFilled: filled }, pricing: { tduCentsPerKwh: cents, tduMonthlyDollars: monthly } }) as unknown as PlanRecord;
    const c = tduCandidates([r(6.5333, 4.9), r(6.5333, 4.9), r(6.5611, 4.9), r(1, 1, true), r(1, 1, true), r(1, 1, true)]);
    expect(c).toEqual([{ cents: 6.5333, monthly: 4.9 }, { cents: 6.5611, monthly: 4.9 }]);
  });
});
