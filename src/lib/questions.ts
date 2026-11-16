import { annualCost } from "@/lib/bill";
import type { PlanPricing } from "@/lib/plans/schema";

/**
 * "Ask yourself before you sign": questions written by code from the plan's own fine print and your 12 months.
 * Each one points at a real number on the label. Most important first; at most `max`.
 */
export type Question = { key: string; q: string; why: string };

const $ = (d: number) => `$${d.toLocaleString("en-US", { maximumFractionDigits: d % 1 ? 2 : 0, minimumFractionDigits: d % 1 ? 2 : 0 })}`;
const n = (k: number) => k.toLocaleString("en-US");

export function questions(p: PlanPricing, months: number[], max = 4): Question[] {
  const out: Question[] = [];
  // bill credits that need a minimum usage: how many of YOUR months miss it
  for (const c of p.credits.filter((c) => !c.conditional && c.minKwh > 0).sort((a, b) => b.dollars - a.dollars)) {
    const miss = months.filter((m) => m < c.minKwh || (c.maxKwh !== null && m > c.maxKwh)).length;
    const range = c.maxKwh === null ? `${n(c.minKwh)} kWh or more` : `between ${n(c.minKwh)} and ${n(c.maxKwh)} kWh`;
    out.push({
      key: "credit",
      q: `Will I use ${range} every single month?`,
      why: miss ? `The ${$(c.dollars)} credit needs it. With your usage you'd miss it ${miss} month${miss === 1 ? "" : "s"} a year, ${$(miss * c.dollars)} in all.` : `The ${$(c.dollars)} credit needs it. Your usage gets it every month, but a mild month or a trip could cost you ${$(c.dollars)}.`,
    });
    break;
  }
  for (const f of p.usageFees.filter((f) => f.dollars > 0)) {
    out.push({ key: "minfee", q: `Could I ever use less than ${n(f.belowKwh)} kWh in a month (a trip, an empty house)?`, why: `This plan adds ${$(f.dollars)} to any month under ${n(f.belowKwh)} kWh.` });
    break;
  }
  const cond = p.credits.filter((c) => c.conditional);
  if (cond.length) {
    const without = annualCost(p, months, { includeConditional: false }) - annualCost(p, months, { includeConditional: true });
    out.push({
      key: "cond",
      q: `Am I okay with what the "${cond[0].label}" needs, like autopay or paperless bills?`,
      why: without > 0.5 ? `Without it, your year costs about ${$(Math.round(without))} more.` : "The label ties a discount to it.",
    });
  }
  if (p.termMonths > 0 && p.termMonths <= 6) {
    out.push({ key: "short", q: `What will I pay after ${p.termMonths} month${p.termMonths === 1 ? "" : "s"}?`, why: `This price only lasts ${p.termMonths} month${p.termMonths === 1 ? "" : "s"}. After that the plan can change, so set a reminder to shop again.` });
  }
  if (p.touPeriods.length) {
    const cheap = [...p.touPeriods].sort((a, b) => a.cents - b.cents)[0];
    out.push({ key: "tou", q: `Can I really move ${Math.round(cheap.share * 100)}% of my use into "${cheap.label}"?`, why: "The label's price assumes that mix. Use less in those hours and you pay more." });
  }
  const tiers = [...p.energyTiers].sort((a, b) => a.fromKwh - b.fromKwh);
  if (tiers.length > 1) {
    const jump = tiers.find((t, i) => i > 0 && t.cents > tiers[i - 1].cents);
    if (jump) out.push({ key: "tier", q: `How often do I go over ${n(jump.fromKwh)} kWh?`, why: `Every kWh above that costs ${jump.cents}¢ instead of ${tiers[tiers.indexOf(jump) - 1].cents}¢.` });
  }
  for (const f of p.amortizedFees) {
    out.push({ key: "setup", q: `Am I okay paying a one-time ${$(f.dollars)} for "${f.label}"?`, why: `The label's average price spreads it over ${f.months} months, so the sticker price doesn't show it all at once.` });
    break;
  }
  if (p.earlyTerminationFee.dollars > 0) {
    const etf = p.earlyTerminationFee;
    out.push({
      key: "exit",
      q: "Might I want to switch before the contract ends?",
      why: etf.perMonthRemaining ? `Leaving early costs ${$(etf.dollars)} for every month left.` : `Leaving early costs ${$(etf.dollars)}.`,
    });
  }
  return out.slice(0, max);
}
