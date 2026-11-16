import { findCliffs, monthlyBill } from "@/lib/bill";
import type { PlanPricing } from "@/lib/plans/schema";

/** Two plans over the same 12 months: each month's bill, the yearly totals, and who wins which months. Code only. */
export function compareYear(a: PlanPricing, b: PlanPricing, months: number[], opts: { includeConditional?: boolean } = {}) {
  const rows = months.map((kwh) => {
    const ba = monthlyBill(a, kwh, opts), bb = monthlyBill(b, kwh, opts);
    return { kwh, a: ba, b: bb, cheaper: ba < bb ? "a" : bb < ba ? "b" : "tie" } as const;
  });
  const total = (k: "a" | "b") => Math.round(rows.reduce((s, r) => s + r[k], 0) * 100) / 100;
  const ta = total("a"), tb = total("b");
  return {
    rows,
    totalA: ta,
    totalB: tb,
    diff: Math.round((tb - ta) * 100) / 100, // > 0: B costs more
    winsA: rows.filter((r) => r.cheaper === "a").length,
    winsB: rows.filter((r) => r.cheaper === "b").length,
    cliffsA: findCliffs(a),
    cliffsB: findCliffs(b),
  };
}
