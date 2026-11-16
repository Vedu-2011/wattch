import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { labelCheck } from "@/lib/bill";
import { PlanRecord } from "./schema";

const snap = JSON.parse(readFileSync("data/plans.json", "utf8")) as { counts: Record<string, number>; plans: unknown[] };
const plans = snap.plans.map((p) => PlanRecord.parse(p));

describe("the shipped snapshot (data/plans.json)", () => {
  it("every record fits the schema and the counts add up", () => {
    const counts = plans.reduce<Record<string, number>>((c, r) => ((c[r.check.status] = (c[r.check.status] ?? 0) + 1), c), {});
    expect(counts).toEqual(snap.counts);
  });
  it("every verified plan still rebuilds all 3 label prices with today's bill math", () => {
    const bad = plans.filter((r) => r.check.status === "verified" && !(r.pricing && labelCheck(r.pricing).ok)).map((r) => r.meta.id);
    expect(bad).toEqual([]);
  });
  it("every verified plan's printed averages are the ones on file in the check rows", () => {
    for (const r of plans.filter((x) => x.check.status === "verified")) {
      expect(r.check.rows.map((x) => x.printed)).toEqual([r.pricing!.labelAvg.k500, r.pricing!.labelAvg.k1000, r.pricing!.labelAvg.k2000]);
    }
  });
});
