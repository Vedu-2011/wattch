import type { PlanPricing } from "@/lib/plans/schema";

/**
 * "Should I switch?" — plain math, no AI.
 * extraPerYear: what your current plan costs over the same 12 months minus the best plan.
 * fee: your early termination fee, from your current plan's own label ("$20 × months left" or a flat amount).
 * Rule: switch now if the fee is less than what you'd save before your contract ends; otherwise wait.
 */
export type SwitchMath = {
  extraPerYear: number;
  perMonth: number;
  fee: number;
  paybackMonths: number | null;
  verdict: "stay" | "switch" | "wait";
};

export function exitFee(p: PlanPricing, monthsLeft: number): number {
  if (monthsLeft <= 0) return 0;
  const f = p.earlyTerminationFee;
  return f.perMonthRemaining ? f.dollars * monthsLeft : f.dollars;
}

export function switchMath(currentAnnual: number, bestAnnual: number, current: PlanPricing, monthsLeft: number): SwitchMath {
  const extraPerYear = Math.round((currentAnnual - bestAnnual) * 100) / 100;
  const perMonth = Math.round((extraPerYear / 12) * 100) / 100;
  const fee = exitFee(current, monthsLeft);
  if (extraPerYear <= 0) return { extraPerYear, perMonth, fee, paybackMonths: null, verdict: "stay" };
  const paybackMonths = fee === 0 ? 0 : Math.ceil(fee / perMonth);
  // waiting out the contract costs perMonth × monthsLeft; paying the fee now costs fee
  const verdict = fee <= perMonth * monthsLeft || fee === 0 ? "switch" : "wait";
  return { extraPerYear, perMonth, fee, paybackMonths, verdict };
}

/** One plain sentence for the result. */
export function switchLine(m: SwitchMath, monthsLeft: number): string {
  const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
  const mo = (n: number) => (n === 1 ? "1 month" : `${n} months`);
  if (m.verdict === "stay") return "Your plan already costs the same or less than the best one we found at your usage. Stay put.";
  if (m.fee === 0) return `You're paying ${usd(m.extraPerYear)} a year more than your best plan, and leaving costs nothing. Switch.`;
  if (m.verdict === "switch")
    return `You're paying ${usd(m.extraPerYear)} a year more. Leaving costs ${usd(m.fee)}, which the savings pay back in ${mo(m.paybackMonths!)} — sooner than your ${mo(monthsLeft)} left. Switch now.`;
  return `You're paying ${usd(m.extraPerYear)} a year more, but leaving costs ${usd(m.fee)} — more than the ${usd(m.perMonth * monthsLeft)} you'd save in your last ${mo(monthsLeft)}. Wait until your contract ends, then switch.`;
}
