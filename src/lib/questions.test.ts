import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PlanRecord } from "@/lib/plans/schema";
import { questions } from "./questions";
import { yearFor } from "./rank";

const plans = (JSON.parse(readFileSync("data/plans.json", "utf8")).plans as unknown[]).map((p) => PlanRecord.parse(p));
const pricing = (id: string) => plans.find((p) => p.meta.id === id)!.pricing!;
const year = yearFor(1100, true);

// Hand-checked against data/text/<id>.txt on Nov 16 (exit fees: 33633 $150, 24328 $175, 17330 $175, 35975 $200).
describe("questions to ask before you sign", () => {
  it("Simple Saver 3 (33633): the credit cliff first, with YOUR missed months; then the 3-month term; then the $150 exit fee", () => {
    const q = questions(pricing("33633"), year);
    expect(q.map((x) => x.key)).toEqual(["credit", "short", "exit"]);
    expect(q[0].q).toBe("Will I use 1,000 kWh or more every single month?");
    expect(q[0].why).toBe("The $125 credit needs it. With your usage you'd miss it 6 months a year, $750 in all.");
    expect(q[2].why).toBe("Leaving early costs $150.");
  });
  it("Power Perks - 12 (24328): credit, then the $4.99 fee under 400 kWh", () => {
    const q = questions(pricing("24328"), year);
    expect(q.map((x) => x.key)).toEqual(["credit", "minfee", "exit"]);
    expect(q[1].why).toBe("This plan adds $4.99 to any month under 400 kWh.");
  });
  it("Sustainable Simply Days - 3 (17330): time-of-day mix and the $49.99 setup fee", () => {
    const q = questions(pricing("17330"), year);
    expect(q.map((x) => x.key)).toEqual(["short", "tou", "setup", "exit"]);
    expect(q[1].q).toMatch(/move 33% of my use/);
    expect(q[2].q).toBe('Am I okay paying a one-time $49.99 for "One-time GoodBundle setup"?');
  });
  it("a heavy user who always clears the credit still gets a gentler warning", () => {
    const q = questions(pricing("33633"), yearFor(2000, false));
    expect(q[0].why).toMatch(/gets it every month/);
  });
  it("every verified plan: at most 4 questions, all plain text with no NaN/undefined", () => {
    for (const r of plans.filter((p) => p.check.status === "verified" && p.pricing)) {
      const q = questions(r.pricing!, year);
      expect(q.length).toBeLessThanOrEqual(4);
      for (const x of q) expect(`${x.q} ${x.why}`, r.meta.id).not.toMatch(/NaN|undefined|Infinity|\$-/);
    }
  });
});

describe("Spanish questions", () => {
  it("same questions, same numbers, in Spanish", () => {
    const en = questions(pricing("33633"), year);
    const es = questions(pricing("33633"), year, 4, "es");
    expect(es.map((q) => q.key)).toEqual(en.map((q) => q.key));
    expect(es[0].q).toBe("¿Voy a usar 1,000 kWh o más todos los meses, sin falta?");
    expect(es[0].why).toContain("6 meses al año, $750 en total");
    expect(es.map((q) => q.q + q.why).join(" ")).not.toMatch(/\b(the|you|month|every|costs)\b/);
  });
});
