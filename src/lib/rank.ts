import { annualCost, findCliffs, flatYear, monthlyBill } from "@/lib/bill";
import type { PlanPricing } from "@/lib/plans/schema";

export type ClientPlan = {
  id: string;
  provider: string;
  planName: string;
  rateType: string;
  renewablePct: number;
  prepaid: boolean;
  timeOfUse: boolean;
  eflUrl: string;
  enrollUrl: string;
  ptc: { k500: number; k1000: number; k2000: number };
  status: "verified" | "mismatch" | "unread";
  via: "direct" | "anakin";
  fetchedAt: string;
  readMs: number;
  message: string;
  rows: { kwh: number; printed: number; ours: number; ok: boolean }[];
  pricing: PlanPricing | null;
};

export type Ranked = { plan: ClientPlan; monthly: number; annual: number; avgCents: number };

export type Trap = { key: string; label: string; tone: "over" | "volt" | "sky" };

export function traps(p: PlanPricing): Trap[] {
  const out: Trap[] = [];
  const cliffs = findCliffs(p, 100, 3000, 5);
  if (p.credits.some((c) => !c.conditional && c.minKwh > 0)) out.push({ key: "credit", label: "Bill-credit cliff", tone: "over" });
  if (p.usageFees.length) out.push({ key: "minfee", label: "Minimum-use fee", tone: "over" });
  if (!out.length && cliffs.length) out.push({ key: "cliff", label: "Price cliff", tone: "over" });
  if (p.credits.some((c) => c.conditional)) out.push({ key: "cond", label: "Needs autopay/extra", tone: "volt" });
  if (p.energyTiers.length > 1) out.push({ key: "tier", label: "Tiered price", tone: "volt" });
  if (p.touPeriods.length) out.push({ key: "tou", label: "Time-of-use", tone: "sky" });
  if (p.amortizedFees.length) out.push({ key: "setup", label: "Setup fee", tone: "volt" });
  return out;
}

export const rankable = (plans: ClientPlan[]) => plans.filter((p) => p.status === "verified" && p.pricing && !p.prepaid);

export function rank(plans: ClientPlan[], kwh: number, includeConditional = true): Ranked[] {
  return rankable(plans)
    .map((plan) => {
      const monthly = monthlyBill(plan.pricing!, kwh, { includeConditional });
      return { plan, monthly, annual: annualCost(plan.pricing!, flatYear(kwh), { includeConditional }), avgCents: Math.round((monthly / kwh) * 1000) / 10 };
    })
    .sort((a, b) => a.annual - b.annual || a.plan.provider.localeCompare(b.plan.provider));
}

/** What Power to Choose puts first: lowest printed average at 1,000 kWh (its default view). */
export function ptcTopPick(plans: ClientPlan[]): ClientPlan | null {
  const r = rankable(plans).sort((a, b) => a.ptc.k1000 - b.ptc.k1000 || a.ptc.k500 - b.ptc.k500);
  return r[0] ?? null;
}

/** Where a plan stops being the cheapest one, scanning usage in 10 kWh steps. */
export function cheapestRange(plans: ClientPlan[], id: string, includeConditional = true): { from: number; to: number } | null {
  let from: number | null = null, to: number | null = null;
  for (let k = 100; k <= 3000; k += 10) {
    const top = rank(plans, k, includeConditional)[0];
    if (top?.plan.id === id) { if (from === null) from = k; to = k; }
    else if (from !== null) break;
  }
  return from === null ? null : { from, to: to! };
}
