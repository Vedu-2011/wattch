import { describe, expect, it } from "vitest";
import { diffPlans, diffReport, needsRead } from "./diff";
import type { PlanMeta } from "./schema";

const plan = (id: string, k1000 = 12, eflUrl = `https://example.test/${id}.pdf`): PlanMeta => ({
  id, provider: "Sample Power", planName: `Plan ${id}`, rateType: "Fixed", renewablePct: 0, prepaid: false, timeOfUse: false,
  eflUrl, enrollUrl: "", website: "", rating: null, ptc: { k500: k1000 + 2, k1000, k2000: k1000 - 1 },
});

describe("diffPlans", () => {
  const before = [plan("1"), plan("2"), plan("3"), plan("4")];
  const after = [plan("1"), plan("2", 13.5), plan("3", 12, "https://example.test/new.pdf"), plan("5")];
  const d = diffPlans(before, after);
  it("finds new, gone, price changes and moved labels", () => {
    expect(d.added.map((m) => m.id)).toEqual(["5"]);
    expect(d.removed.map((m) => m.id)).toEqual(["4"]);
    expect(d.priceChanged.map((p) => [p.before.ptc.k1000, p.after.ptc.k1000])).toEqual([[12, 13.5]]);
    expect(d.labelMoved.map((m) => m.id)).toEqual(["3"]);
    expect(d.unchanged).toBe(1);
  });
  it("only new or changed plans need the AI again", () => {
    expect(needsRead(d).sort()).toEqual(["2", "3", "5"]);
  });
  it("same list → nothing to do", () => {
    const same = diffPlans(before, before);
    expect(needsRead(same)).toEqual([]);
    expect(diffReport(same, "Houston")).toMatch(/No changes on the state.s list/);
    expect(diffReport(same, "Houston")).toMatch(/re-downloads every label/);
  });
  it("the report is plain and lists the changes", () => {
    const r = diffReport(d, "Houston");
    expect(r).toMatch(/1 plans unchanged · 1 new · 1 gone · 1 advertised price changes · 1 fine-print links moved/);
    expect(r).toMatch(/Plan 2 \(Sample Power\): 12¢ → 13.5¢/);
    expect(r).toMatch(/3 labels need the AI reader again/);
  });
});
