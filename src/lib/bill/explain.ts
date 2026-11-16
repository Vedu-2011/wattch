import type { PlanPricing } from "@/lib/plans/schema";
import { billLines } from "./index";

/**
 * "Why is my bill this much?" — one plain sentence per bill line, written by code from the plan's own numbers.
 * Keys match billLines() so the page can put each sentence under its line. Plus "missed" sentences for credits the
 * usage just misses (the trap people don't see coming).
 */
export type LineWhy = { key: string; text: string };

const $ = (d: number) => `$${d.toFixed(2)}`;
const n = (k: number) => k.toLocaleString("en-US");
/** cents as the label prints them (up to 4 decimals, e.g. CenterPoint's 6.5611¢) */
const c = (x: number) => `${Number(x.toFixed(4))}¢`;

function energyWhy(p: PlanPricing, kwh: number): string {
  if (p.touPeriods.length > 0) {
    const parts = p.touPeriods.map((t) => `${Math.round(t.share * 100)}% at ${c(t.cents)} (${t.label})`);
    return `Priced by time of day, using the label's own mix: ${parts.join(", ")}. Your mix may differ.`;
  }
  const tiers = [...p.energyTiers].sort((a, b) => a.fromKwh - b.fromKwh);
  if (tiers.length === 1) return `${n(kwh)} kWh × ${c(tiers[0].cents)}, the provider's price for the power itself.`;
  const used = tiers.filter((t) => kwh > t.fromKwh);
  const parts = used.map((t, i) => {
    const next = tiers[tiers.indexOf(t) + 1];
    const top = next ? Math.min(kwh, next.fromKwh) : kwh;
    return `${i === 0 ? "the first" : "the next"} ${n(top - t.fromKwh)} kWh at ${c(t.cents)}`;
  });
  return `This plan changes price as you use more: ${parts.join(", then ")}.`;
}

export function explainBill(p: PlanPricing, kwh: number, opts: { includeConditional?: boolean; utility?: string } = {}): LineWhy[] {
  const utility = opts.utility ?? "CenterPoint";
  const out: LineWhy[] = billLines(p, kwh, opts).map((l) => {
    if (l.key === "energy") return { key: l.key, text: energyWhy(p, kwh) };
    if (l.key === "base") {
      return { key: l.key, text: p.baseChargeDollars > 0 ? `A flat ${$(p.baseChargeDollars)} from the provider every month, however much you use.` : "This plan has no monthly base charge." };
    }
    if (l.key === "tduKwh") {
      return { key: l.key, text: p.tduCentsPerKwh > 0 ? `${n(kwh)} kWh × ${c(p.tduCentsPerKwh)} for ${utility}'s wires to your home. The provider passes this on.` : `This plan's label folds ${utility}'s delivery charges into its other prices, so there's no separate line.` };
    }
    if (l.key === "tduMonthly") {
      return { key: l.key, text: p.tduMonthlyDollars > 0 ? `${utility}'s flat monthly delivery fee, passed on by the provider.` : `No separate monthly delivery fee on this plan's label.` };
    }
    if (l.key.startsWith("fee-")) {
      const f = p.usageFees[Number(l.key.slice(4))];
      if (f.dollars === 0) return { key: l.key, text: "The label lists this fee at $0, so it costs nothing." };
      return { key: l.key, text: `You used under ${n(f.belowKwh)} kWh, so this plan adds ${$(f.dollars)}. Use ${n(f.belowKwh - kwh)} kWh more and it goes away.` };
    }
    if (l.key.startsWith("amort-")) {
      const f = p.amortizedFees[Number(l.key.slice(6))];
      return { key: l.key, text: `A one-time ${$(f.dollars)} charge, spread over ${f.months} months the same way the label counts it.` };
    }
    if (l.key.startsWith("credit-")) {
      const cr = p.credits[Number(l.key.slice(7))];
      const range = cr.maxKwh === null ? `at least ${n(cr.minKwh)} kWh` : `between ${n(cr.minKwh)} and ${n(cr.maxKwh)} kWh`;
      return { key: l.key, text: `You used ${range}, so you get ${$(cr.dollars)} off${cr.conditional ? ", only if you meet the label's extra condition (like autopay)" : ""}.` };
    }
    return { key: l.key, text: "" };
  });
  // credits this month just misses
  p.credits.forEach((cr, i) => {
    if (cr.conditional && opts.includeConditional === false) return;
    if (kwh < cr.minKwh) out.push({ key: `missed-${i}`, text: `Missed: ${$(cr.dollars)} off needs ${n(cr.minKwh)} kWh. That's ${n(cr.minKwh - kwh)} kWh more than this month.` });
    else if (cr.maxKwh !== null && kwh > cr.maxKwh) out.push({ key: `missed-${i}`, text: `Missed: ${$(cr.dollars)} off stops above ${n(cr.maxKwh)} kWh. You used ${n(kwh - cr.maxKwh)} kWh too many for it.` });
  });
  return out;
}
