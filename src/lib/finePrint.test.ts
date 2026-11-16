import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { billLines } from "@/lib/bill";
import type { PlanPricing } from "@/lib/plans/schema";
import { belongs, centsForms, labelSegments } from "./finePrint";

const text = (id: string) => readFileSync(`test-data/labels/${id}.txt`, "utf8");
const base: PlanPricing = {
  baseChargeDollars: 0, energyTiers: [{ fromKwh: 0, cents: 11.649 }], tduCentsPerKwh: 6.5611, tduMonthlyDollars: 4.9,
  credits: [{ minKwh: 1000, maxKwh: null, dollars: 125, label: "credit", conditional: false }], usageFees: [], amortizedFees: [],
  touPeriods: [], termMonths: 3, earlyTerminationFee: { dollars: 150, perMonthRemaining: false },
  labelAvg: { k500: 19.2, k1000: 6.2, k2000: 12.2 }, notes: [],
};

describe("fine-print highlighter", () => {
  it("knows the ways a label prints a price", () => {
    expect(centsForms(6.5333)).toEqual(expect.arrayContaining(["6.5333", "6.53330", "6.533300", "0.065333"]));
    expect(centsForms(13.097)).toEqual(expect.arrayContaining(["13.097", "13.0970", "0.130970"]));
  });
  it("AP Gas Simple Saver 3 (real label): finds the 3 averages, energy price, $125 credit and $150 fee", () => {
    const { segments, found } = labelSegments(text("33633"), base);
    expect(segments.map((s) => s.text).join("")).toBe(text("33633")); // nothing lost or added
    for (const k of ["avg-500", "avg-1000", "avg-2000", "energy-tier-0", "credit-0", "etf", "tduMonthly"]) expect(found[k], k).toBeGreaterThan(0);
    expect(segments.find((s) => s.key === "avg-1000")!.text).toBe("6.2");
    expect(segments.find((s) => s.key === "credit-0")!.text).toMatch(/\$ ?125/);
  });
  it("same average printed 3 times ('12.2¢ 12.2¢ 12.2¢') → one each, in order", () => {
    const { segments } = labelSegments("Average price per kWh: 12.2¢ 12.2¢ 12.2¢", { ...base, labelAvg: { k500: 12.2, k1000: 12.2, k2000: 12.2 } });
    expect(segments.filter((s) => s.key).map((s) => s.key)).toEqual(["avg-500", "avg-1000", "avg-2000"]);
  });
  it("whole-dollar amounts need a $ or .00, so '125 kWh' isn't a $125 credit", () => {
    expect(labelSegments("usage of 125 kWh", base).found["credit-0"]).toBe(0);
    expect(labelSegments("a $125.00 credit", base).found["credit-0"]).toBe(1);
  });
  it("delivery filled from CenterPoint isn't looked for on the label", () => {
    expect(labelSegments(text("33633"), base, { tduFilled: true }).found.tduKwh).toBeUndefined();
  });
  it("TXU Free Nights (time-of-use, real label): the 18.6¢ daytime price lights up under 'Energy charge'", () => {
    const p: PlanPricing = { ...base, energyTiers: [{ fromKwh: 0, cents: 18.6 }], credits: [], touPeriods: [
      { label: "Free nights", share: 0.4313, cents: 0 }, { label: "Daytime", share: 0.5687, cents: 18.6 }] };
    const { segments } = labelSegments(text("36599"), p);
    const energy = segments.filter((s) => s.key && belongs(s.key, "energy"));
    expect(energy.length).toBeGreaterThan(0);
    expect(energy[0].text).toMatch(/^18\.60*$/);
  });
  it("every bill line has a key the highlighter understands", () => {
    const keys = billLines(base, 1100).map((l) => l.key);
    expect(keys).toEqual(["energy", "base", "tduKwh", "tduMonthly", "credit-0"]);
  });
});
