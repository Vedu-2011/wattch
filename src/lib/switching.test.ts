import { describe, expect, it } from "vitest";
import type { PlanPricing } from "@/lib/plans/schema";
import { exitFee, switchLine, switchMath } from "./switching";

const plan = (dollars: number, perMonthRemaining = false): PlanPricing => ({
  baseChargeDollars: 0, energyTiers: [{ fromKwh: 0, cents: 10 }], tduCentsPerKwh: 0, tduMonthlyDollars: 0, credits: [], usageFees: [],
  amortizedFees: [], touPeriods: [], termMonths: 12, earlyTerminationFee: { dollars, perMonthRemaining }, labelAvg: { k500: 0, k1000: 0, k2000: 0 }, notes: [],
});

describe("should I switch? (early termination fee math)", () => {
  it("case 1: $378/yr more, flat $150 fee, 8 months left → fee pays back in 5 months → switch now", () => {
    const m = switchMath(1712.36, 1334.25, plan(150), 8);
    expect(m.extraPerYear).toBe(378.11);
    expect(m.perMonth).toBe(31.51);
    expect(m.fee).toBe(150);
    expect(m.paybackMonths).toBe(5); // 150 / 31.51 = 4.76 → 5
    expect(m.verdict).toBe("switch");
    expect(switchLine(m, 8)).toBe("You're paying $378 a year more. Leaving costs $150, which the savings pay back in 5 months — sooner than your 8 months left. Switch now.");
  });
  it("case 2: $20 × months left (Express style), 10 left = $200, saving $120/yr → wait", () => {
    expect(exitFee(plan(20, true), 10)).toBe(200);
    const m = switchMath(1500, 1380, plan(20, true), 10);
    expect(m.perMonth).toBe(10);
    expect(m.paybackMonths).toBe(20);
    expect(m.verdict).toBe("wait"); // $200 fee > $10 × 10 = $100 saved before the contract ends
    expect(switchLine(m, 10)).toContain("Wait until your contract ends");
  });
  it("case 3: already cheapest → stay; contract over → no fee", () => {
    expect(switchMath(1300, 1334, plan(150), 6).verdict).toBe("stay");
    const m = switchMath(1400, 1300, plan(150), 0);
    expect(m.fee).toBe(0);
    expect(m.paybackMonths).toBe(0);
    expect(switchLine(m, 0)).toContain("leaving costs nothing");
  });
});

describe("Spanish switch answer", () => {
  it("same verdicts, same numbers, in Spanish", async () => {
    const { switchLine } = await import("./switching");
    const m = { verdict: "switch", fee: 150, extraPerYear: 378, perMonth: 31.5, paybackMonths: 5 } as Parameters<typeof switchLine>[0];
    expect(switchLine(m, 8, "es")).toBe("Estás pagando $378 más al año. Salirte cuesta $150, y el ahorro lo paga en 5 meses, antes de los 8 meses que te quedan. Cámbiate ya.");
    expect(switchLine({ ...m, verdict: "wait" }, 3, "es")).toContain("Espera a que termine tu contrato");
  });
});
