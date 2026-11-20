import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PlanRecord } from "@/lib/plans/schema";
import { billLines } from "./index";
import { explainBill } from "./explain";

const plans = (JSON.parse(readFileSync("data/plans.json", "utf8")).plans as unknown[]).map((p) => PlanRecord.parse(p));
const pricing = (id: string) => plans.find((p) => p.meta.id === id)!.pricing!;
const text = (id: string, kwh: number, opts = {}) => Object.fromEntries(explainBill(pricing(id), kwh, opts).map((w) => [w.key, w.text]));

// Three plans checked by hand against their labels (data/text/<id>.txt), Nov 16.
describe("why each bill line (hand-checked plans)", () => {
  it("Power Perks - 12 (24328): $125 credit at 1,000 kWh, $4.99 fee under 400", () => {
    const at900 = text("24328", 900);
    expect(at900.energy).toBe("900 kWh × 14.3¢, the provider's price for the power itself.");
    expect(at900.base).toBe("This plan has no monthly base charge.");
    expect(at900.tduKwh).toBe("900 kWh × 6.5611¢ for CenterPoint's wires to your home. The provider passes this on.");
    expect(at900["missed-0"]).toBe("Missed: $125.00 off needs 1,000 kWh. That's 100 kWh more than this month.");
    const at1000 = text("24328", 1000);
    expect(at1000["credit-0"]).toBe("You used at least 1,000 kWh, so you get $125.00 off.");
    expect(at1000["missed-0"]).toBeUndefined();
    expect(text("24328", 300)["fee-0"]).toBe("You used under 400 kWh, so this plan adds $4.99. Use 100 kWh more and it goes away.");
  });
  it("Sustainable Simply Days - 3 (17330): time-of-day mix + a setup fee spread over 12 months", () => {
    const t = text("17330", 1100);
    expect(t.energy).toBe("Priced by time of day, using the label's own mix: 33% at 0¢ (Day Hours 9 AM–4 PM (energy credited back)), 67% at 4.3¢ (All other hours). Your mix may differ.");
    expect(t["amort-0"]).toBe("A one-time $49.99 charge, spread over 12 months the same way the label counts it.");
  });
  it("Texas Instant 12 (35975): delivery folded in, two price blocks, a $0 fee", () => {
    const t = text("35975", 1500);
    expect(t.energy).toBe("This plan changes price as you use more: the first 1,000 kWh at 0¢, then the next 500 kWh at 14¢.");
    expect(t.base).toBe("A flat $130.00 from the provider every month, however much you use.");
    expect(t.tduKwh).toMatch(/folds CenterPoint's delivery charges into its other prices/);
    expect(text("35975", 800)["fee-0"]).toBe("The label lists this fee at $0, so it costs nothing.");
  });
});

describe("explainBill", () => {
  it("has a non-empty sentence for every bill line, on every verified plan, at several usages", () => {
    for (const r of plans.filter((p) => p.check.status === "verified" && p.pricing)) {
      for (const kwh of [300, 1100, 2500]) {
        const lines = billLines(r.pricing!, kwh);
        const why = explainBill(r.pricing!, kwh);
        for (const l of lines) expect(why.find((w) => w.key === l.key)?.text, `${r.meta.id} ${l.key}`).toBeTruthy();
        for (const w of why) expect(w.text).not.toMatch(/NaN|undefined|Infinity/);
      }
    }
  });
  it("uses the area's utility name", () => {
    expect(text("24328", 900, { utility: "Oncor" }).tduKwh).toMatch(/Oncor's wires/);
  });
});

describe("Spanish bill sentences", () => {
  it("every line and the missed credit are in Spanish with the same numbers", () => {
    const es = text("33633", 900, { lang: "es" });
    const en = text("33633", 900);
    expect(Object.keys(es)).toEqual(Object.keys(en));
    expect(es.tduKwh).toBe("900 kWh × 6.5611¢ por los cables de CenterPoint hasta tu casa. El proveedor te lo pasa.");
    expect(es["missed-0"]).toMatch(/^Te lo perdiste: el crédito de \$125.00 pide 1,000 kWh\. Son 100 kWh más que este mes\.$/);
    expect(Object.values(es).join(" ")).not.toMatch(/\b(the|you|your|month|provider)\b/);
  });
});
