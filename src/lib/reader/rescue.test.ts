import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { labelCheck, monthlyBill } from "@/lib/bill";
import type { PlanRecord } from "@/lib/plans/schema";
import { fillTdu, grounded } from "./parse";
import { rescue, tduCandidates, type ManualRead } from "./rescue";
import { ptcAveragesOnLabel, readSoFedForm } from "./templates";

const text = (id: string) => readFileSync(`data/text/${id}.txt`, "utf8");
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
  it("a hand-read of a different file (sha changed) is ignored", () => {
    const m = manual("35975");
    const rec = { meta: { ptc: { k500: 26, k1000: 13, k2000: 13.5 } }, read: { parsedBy: "x", sha256: "other" }, pricing: null,
      check: { status: "mismatch", rows: [], message: "" } } as unknown as PlanRecord;
    expect(rescue(rec, text("35975"), CNP, m)).toBeNull();
    expect(rescue({ ...rec, read: { ...rec.read, sha256: m.sha256 } }, text("35975"), CNP, m)).not.toBeNull();
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

describe("tduCandidates()", () => {
  it("picks the most common printed CenterPoint charges and skips filled ones", () => {
    const r = (cents: number, monthly: number, filled = false) => ({ check: { status: "verified", tduFilled: filled }, pricing: { tduCentsPerKwh: cents, tduMonthlyDollars: monthly } }) as unknown as PlanRecord;
    const c = tduCandidates([r(6.5333, 4.9), r(6.5333, 4.9), r(6.5611, 4.9), r(1, 1, true), r(1, 1, true), r(1, 1, true)]);
    expect(c).toEqual([{ cents: 6.5333, monthly: 4.9 }, { cents: 6.5611, monthly: 4.9 }]);
  });
});
