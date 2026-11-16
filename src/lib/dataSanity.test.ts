import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { clientPlans, planById } = await import("@/lib/plans/data");
const { rank, rankable } = await import("./rank");
const { monthlyBill } = await import("./bill");
const { PLAN_WORDS } = await import("./planWords");
const raw = (await import("../../data/plans.json")).default as { plans: { meta: { id: string } }[] };
const rawDallas = (await import("../../data/plans-dallas.json")).default as { plans: { meta: { id: string } }[] };

const areas = ["houston", "dallas"] as const;
const ids = [...raw.plans, ...rawDallas.plans].map((p) => p.meta.id);

// Checks first run by hand on night 2; kept so a data refresh can't quietly break them.
describe("every plan's numbers are sane", () => {
  for (const area of areas) {
    it(`${area}: yearly cost is a real number between $0 and $10,000 at 200, 1,100 and 3,000 kWh`, () => {
      for (const kwh of [200, 1100, 3000]) for (const r of rank(clientPlans(area), kwh, { area })) {
        expect(Number.isFinite(r.annual) && r.annual > 0 && r.annual < 10000, `${r.plan.id} @${kwh}: ${r.annual}`).toBe(true);
      }
    });
    it(`${area}: real price at 1,100 kWh is between 3¢ and 60¢`, () => {
      for (const r of rank(clientPlans(area), 1100, { area })) {
        expect(r.avgCents, r.plan.id).toBeGreaterThan(3);
        expect(r.avgCents, r.plan.id).toBeLessThan(60);
      }
    });
    it(`${area}: no monthly bill below $0 anywhere from 100 to 3,000 kWh`, () => {
      for (const p of rankable(clientPlans(area))) for (let k = 100; k <= 3000; k += 10) {
        const b = monthlyBill(p.pricing!, k);
        if (!(Number.isFinite(b) && b >= 0)) expect.fail(`${p.id} ${p.planName} @${k} kWh: ${b}`);
      }
    });
  }
});

describe("every plan record", () => {
  it("has a provider, a plan name and an https label link", () => {
    for (const id of ids) {
      const r = planById(id)!;
      expect(r.meta.provider.trim(), id).not.toBe("");
      expect(r.meta.planName.trim(), id).not.toBe("");
      expect(r.meta.eflUrl, id).toMatch(/^https:\/\//);
    }
  });
  it("hand-read labels say so in Spanish too", () => {
    const hand = ids.map((id) => planById(id)!).filter((r) => r.read.parsedBy.startsWith("hand-read"));
    expect(hand.length).toBeGreaterThan(0);
    for (const r of hand) expect(PLAN_WORDS.es.readBy(r.read.parsedBy), r.meta.id).toMatch(/^leída a mano por .+, \d{1,2} [a-z]{3} \d{4}$/);
  });
});
