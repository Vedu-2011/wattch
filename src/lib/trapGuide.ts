import type { Area } from "@/lib/plans/ptc";
import type { PlanPricing } from "@/lib/plans/schema";
import { type ClientPlan, rank, rankable } from "@/lib/rank";

export type TrapKind = { key: string; name: string; test: (p: PlanPricing) => boolean; what: string; bite: string };

/** Every kind of fine-print catch Wattch looks for. Plain words; the numbers come from code below. */
export const TRAP_KINDS: TrapKind[] = [
  { key: "credit", name: "Bill-credit cliff", test: (p) => p.credits.some((c) => !c.conditional && c.minKwh > 0),
    what: "A big credit (often $100–$125) that only comes off your bill in months you use more than a set amount, like 1,000 kWh.",
    bite: "The advertised price assumes you get the credit. In a mild month you miss it, and that month's bill jumps." },
  { key: "minfee", name: "Minimum-use fee", test: (p) => p.usageFees.length > 0,
    what: "An extra fee added in months you use less than a set amount.",
    bite: "Small homes and apartments pay it in spring and fall, so their real price is higher than the sticker." },
  { key: "tier", name: "Tiered price", test: (p) => p.energyTiers.length > 1,
    what: "The price per kWh changes after a set amount, so your first kWh and your last kWh cost different amounts.",
    bite: "Which tier you land in each month changes your real price, so the 1,000 kWh number may not match your bill." },
  { key: "tou", name: "Time-of-use", test: (p) => p.touPeriods.length > 0,
    what: "Different prices at different times of day, like free nights and pricier afternoons.",
    bite: "The label assumes a typical daily pattern. If you run the AC in the afternoon, you pay the high price more often." },
  { key: "cond", name: "Needs autopay or paperless", test: (p) => p.credits.some((c) => c.conditional),
    what: "A discount you only get if you sign up for autopay, paperless billing, or something similar.",
    bite: "Skip the sign-up and the discount is gone. Wattch counts it by default; a toggle on the ranking turns it off." },
  { key: "setup", name: "Fee spread over the contract", test: (p) => p.amortizedFees.length > 0,
    what: "A one-time fee, like a device or setup fee, that the label spreads over your months.",
    bite: "Leave early and the rest may still be due, on top of the exit fee." },
  { key: "teaser", name: "3-month price", test: (p) => p.termMonths <= 3,
    what: "A low price that only lasts a few months before the plan ends or rolls onto another rate.",
    bite: "A yearly cost at today's price is a best case. After 3 months you'll need to switch again or pay what comes next." },
];

export const GUIDE_USAGES = [600, 1100, 2100] as const;

export type TrapEntry = TrapKind & {
  count: number;
  example: null | {
    id: string; planName: string; provider: string; sticker: number;
    at: { kwh: number; annual: number; extra: number; rank: number; of: number }[];
  };
};

/**
 * For each kind: how many rankable plans have it, and a real example — the plan with that trap whose yearly cost
 * at 1,100 kWh (that area's seasons) is furthest above what its sticker price suggests — priced at 3 usages.
 */
export function trapGuide(plans: ClientPlan[], area: Area = "houston"): TrapEntry[] {
  const pool = rankable(plans);
  const byKwh = new Map(GUIDE_USAGES.map((k) => [k, rank(plans, k, { area })]));
  const mid = byKwh.get(1100)!;
  return TRAP_KINDS.map((t) => {
    const withIt = pool.filter((p) => t.test(p.pricing!));
    // prefer plans where this is the only catch, so the example shows THIS trap and not another one
    const only = (p: PlanPricing) => TRAP_KINDS.every((k) => k.key === t.key || !k.test(p));
    const scored = mid
      .filter((r) => t.test(r.plan.pricing!))
      .map((r) => ({ r, solo: only(r.plan.pricing!), over: r.annual - (r.plan.ptc.k1000 / 100) * r.months.reduce((s, m) => s + m, 0) }))
      .sort((a, b) => Number(b.solo) - Number(a.solo) || b.over - a.over || a.r.plan.id.localeCompare(b.r.plan.id));
    const ex = scored[0]?.r.plan;
    return {
      ...t,
      count: withIt.length,
      example: ex ? {
        id: ex.id, planName: ex.planName, provider: ex.provider, sticker: ex.ptc.k1000,
        at: GUIDE_USAGES.map((kwh) => {
          const list = byKwh.get(kwh)!;
          const i = list.findIndex((r) => r.plan.id === ex.id);
          const annual = list[i].annual;
          return { kwh, annual, extra: Math.round((annual - list[0].annual) * 100) / 100, rank: i + 1, of: list.length };
        }),
      } : null,
    };
  });
}
