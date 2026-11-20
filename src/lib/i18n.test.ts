import { describe, expect, it } from "vitest";
import { MONTHS_BY_LANG, TRAP_LABELS, WORDS, asLang } from "./i18n";
import { whyLine } from "./rank";
import type { PlanPricing } from "./plans/schema";

const base: PlanPricing = {
  baseChargeDollars: 0, energyTiers: [{ fromKwh: 0, cents: 11.649 }], tduCentsPerKwh: 6.5611, tduMonthlyDollars: 4.9,
  credits: [{ minKwh: 1000, maxKwh: null, dollars: 125, label: "credit", conditional: false }], usageFees: [], amortizedFees: [],
  touPeriods: [], termMonths: 3, earlyTerminationFee: { dollars: 150, perMonthRemaining: false },
  labelAvg: { k500: 19.2, k1000: 6.2, k2000: 12.2 }, notes: [],
};
const year = [779, 689, 738, 858, 1211, 1509, 1646, 1789, 1416, 1095, 756, 716];

describe("Spanish words", () => {
  it("has every English key, with no empty strings", () => {
    const en = WORDS.en, es = WORDS.es;
    expect(Object.keys(es).sort()).toEqual(Object.keys(en).sort());
    for (const [k, v] of Object.entries(es)) if (typeof v === "string") expect(v.trim(), k).not.toBe("");
    expect(es.presets).toHaveLength(en.presets.length);
    expect(MONTHS_BY_LANG.es).toHaveLength(12);
  });
  it("names every trap kind", () => {
    expect(Object.keys(TRAP_LABELS.es).sort()).toEqual(["cliff", "cond", "credit", "minfee", "setup", "tier", "tou"]);
  });
  it("anything that isn't 'es' is English", () => {
    expect(asLang("es")).toBe("es");
    for (const v of [null, undefined, "", "EN", "fr", "es-MX"]) expect(asLang(v)).toBe("en");
  });
});

describe("whyLine in Spanish uses the same numbers", () => {
  it("bill-credit cliff", () => {
    expect(whyLine(base, year)).toBe("Its $125 credit only kicks in at 1,000 kWh. You'd miss it 6 months a year — $750 gone.");
    expect(whyLine(base, year, "es")).toBe("Su crédito de $125 solo llega a partir de 1,000 kWh. Te lo perderías 6 meses al año — $750 perdidos.");
  });
  it("credit every month / never", () => {
    expect(whyLine(base, year.map(() => 1500), "es")).toMatch(/lo recibirías todos los meses/);
    expect(whyLine(base, year.map(() => 500), "es")).toMatch(/Nunca lo recibirías/);
  });
  it("minimum-use fee and one month", () => {
    const p = { ...base, credits: [], usageFees: [{ belowKwh: 800, dollars: 9.95, label: "fee" }] };
    expect(whyLine(p, year, "es")).toBe("Cobra $10 cualquier mes con menos de 800 kWh. Para ti son 5 meses al año.");
    expect(whyLine(p, year.map((m, i) => (i === 0 ? 700 : 900)), "es")).toMatch(/Para ti es 1 mes al año/);
  });
});
