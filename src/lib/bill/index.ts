import type { PlanPricing } from "@/lib/plans/schema";

/** Rounds to cents. */
const cents = (d: number) => Math.round(d * 100) / 100;

/** key ties a bill line to the label numbers it was built from (see src/lib/finePrint.ts). */
export type BillLine = { label: string; dollars: number; key: string };

/** Energy charge in dollars for one month, using blocks or the time-of-use mix the EFL assumes. */
export function energyDollars(p: PlanPricing, kwh: number): number {
  if (p.touPeriods.length > 0) {
    return p.touPeriods.reduce((s, t) => s + (kwh * t.share * t.cents) / 100, 0);
  }
  const tiers = [...p.energyTiers].sort((a, b) => a.fromKwh - b.fromKwh);
  let total = 0;
  for (let i = 0; i < tiers.length; i++) {
    const start = tiers[i].fromKwh;
    const end = i + 1 < tiers.length ? tiers[i + 1].fromKwh : Infinity;
    const used = Math.max(0, Math.min(kwh, end) - start);
    total += (used * tiers[i].cents) / 100;
  }
  return total;
}

/** Every line of one month's bill (before taxes), in the order a bill shows them. */
export function billLines(p: PlanPricing, kwh: number, opts: { includeConditional?: boolean } = {}): BillLine[] {
  const includeConditional = opts.includeConditional ?? true;
  const lines: BillLine[] = [
    { label: "Energy charge", dollars: energyDollars(p, kwh), key: "energy" },
    { label: "Base charge", dollars: p.baseChargeDollars, key: "base" },
    { label: "Delivery per kWh", dollars: (kwh * p.tduCentsPerKwh) / 100, key: "tduKwh" },
    { label: "Delivery monthly fee", dollars: p.tduMonthlyDollars, key: "tduMonthly" },
  ];
  p.usageFees.forEach((f, i) => { if (kwh < f.belowKwh) lines.push({ label: f.label, dollars: f.dollars, key: `fee-${i}` }); });
  p.amortizedFees.forEach((f, i) => lines.push({ label: `${f.label} (spread over ${f.months} mo)`, dollars: f.dollars / f.months, key: `amort-${i}` }));
  p.credits.forEach((c, i) => {
    if (c.conditional && !includeConditional) return;
    if (kwh >= c.minKwh && (c.maxKwh === null || kwh <= c.maxKwh)) lines.push({ label: c.label, dollars: -c.dollars, key: `credit-${i}` });
  });
  return lines;
}

export function monthlyBill(p: PlanPricing, kwh: number, opts: { includeConditional?: boolean } = {}): number {
  return cents(billLines(p, kwh, opts).reduce((s, l) => s + l.dollars, 0));
}

/** Average price in cents/kWh, the way an EFL prints it (one decimal). */
export function avgCents(p: PlanPricing, kwh: number): number {
  return Math.round(((monthlyBill(p, kwh) / kwh) * 100) * 10) / 10;
}

export const CHECK_POINTS = [500, 1000, 2000] as const;
/** EFLs round to 0.1¢; we allow one rounding step either way. */
export const CHECK_TOLERANCE = 0.11;

export type CheckRow = { kwh: number; printed: number; ours: number; ok: boolean };

/** The self-check: rebuild the label's own three averages from what the reader pulled out. */
export function labelCheck(p: PlanPricing): { ok: boolean; rows: CheckRow[] } {
  const printed = { 500: p.labelAvg.k500, 1000: p.labelAvg.k1000, 2000: p.labelAvg.k2000 } as const;
  const rows = CHECK_POINTS.map((kwh) => {
    const ours = avgCents(p, kwh);
    return { kwh, printed: printed[kwh], ours, ok: Math.abs(ours - printed[kwh]) <= CHECK_TOLERANCE };
  });
  return { ok: rows.every((r) => r.ok), rows };
}

export function annualCost(p: PlanPricing, months: number[], opts: { includeConditional?: boolean } = {}): number {
  return cents(months.reduce((s, kwh) => s + monthlyBill(p, kwh, opts), 0));
}

/** Places where using ONE less kWh makes the bill jump up by more than `minJump` dollars (bill-credit and minimum-usage traps). */
export function findCliffs(p: PlanPricing, fromKwh = 100, toKwh = 3000, minJump = 5): { kwh: number; below: number; at: number }[] {
  const edges = new Set<number>();
  for (const c of p.credits) {
    edges.add(c.minKwh);
    if (c.maxKwh !== null) edges.add(c.maxKwh + 1);
  }
  for (const f of p.usageFees) edges.add(f.belowKwh);
  const out: { kwh: number; below: number; at: number }[] = [];
  for (const e of [...edges].sort((a, b) => a - b)) {
    if (e < fromKwh || e > toKwh) continue;
    const below = monthlyBill(p, e - 1);
    const at = monthlyBill(p, e);
    if (below - at >= minJump || at - below >= minJump) out.push({ kwh: e, below, at });
  }
  return out;
}

/** Flat 12 months at one usage. */
export const flatYear = (kwh: number) => Array.from({ length: 12 }, () => kwh);
