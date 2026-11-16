import { annualCost, findCliffs, flatYear } from "@/lib/bill";
import type { Lang } from "@/lib/i18n";
import type { PlanPricing } from "@/lib/plans/schema";
import type { Area } from "@/lib/plans/ptc";
import { seasonalYear, shapeFor } from "@/lib/seasons";

export type ClientPlan = {
  id: string;
  provider: string;
  planName: string;
  rateType: string;
  renewablePct: number;
  /** Power to Choose's star rating for the provider (1–5), null/0 when not rated */
  rating?: number | null;
  prepaid: boolean;
  ptc: { k500: number; k1000: number; k2000: number };
  status: "verified" | "mismatch" | "unread";
  readMs: number;
  pricing: PlanPricing | null;
  // Not sent to the browser (the plan page reads the full record on the server); optional so tests can omit them.
  timeOfUse?: boolean;
  eflUrl?: string;
  enrollUrl?: string;
  via?: "direct" | "anakin";
  fetchedAt?: string;
  message?: string;
  rows?: { kwh: number; printed: number; ours: number; ok: boolean }[];
};

/** minTermMonths: only plans whose price is locked at least this long (a 3-month price doesn't last a year). */
/** months: your own 12 months (January → December); when given, it replaces the average + seasons. */
export type RankOpts = {
  includeConditional?: boolean; seasons?: boolean; minTermMonths?: number; months?: number[] | null;
  /** filters: no bill-credit or minimum-use traps · at least this % renewable · at least this many stars */
  noCliffs?: boolean; minRenewable?: number; minRating?: number;
  /** which area's seasons shape the year (Houston by default) */
  area?: Area;
};

/** A plan with a bill credit that needs a usage level, or a fee under a usage level — the "cliff" plans. */
export const hasCliff = (p: PlanPricing) => p.credits.some((c) => !c.conditional && c.minKwh > 0) || p.usageFees.some((f) => f.dollars > 0);

export function passesFilters(plan: ClientPlan, opts: RankOpts): boolean {
  const p = plan.pricing!;
  if (p.termMonths < (opts.minTermMonths ?? 0)) return false;
  if (opts.noCliffs && hasCliff(p)) return false;
  if (plan.renewablePct < (opts.minRenewable ?? 0)) return false;
  if (opts.minRating && (plan.rating ?? 0) < opts.minRating) return false;
  return true;
}
/** monthly = the average month; avgCents = what you really pay per kWh over the year. */
export type Ranked = { plan: ClientPlan; months: number[]; monthly: number; annual: number; avgCents: number };

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

/**
 * Plans we can honestly put a yearly price on: verified, not prepaid, and not variable-rate
 * (a variable plan's price can change every month, so a yearly cost would be a guess).
 */
export const rankable = (plans: ClientPlan[]) =>
  plans.filter((p) => p.status === "verified" && p.pricing && !p.prepaid && p.rateType.toLowerCase() !== "variable");

/** The 12 months we price: flat, or shaped like a real year in that area (Houston by default). */
export const yearFor = (kwh: number, seasons = true, area: Area = "houston") => (seasons ? seasonalYear(kwh, shapeFor(area)) : flatYear(kwh));

export function rank(plans: ClientPlan[], kwh: number, opts: RankOpts = {}): Ranked[] {
  const includeConditional = opts.includeConditional ?? true;
  const months = opts.months?.length === 12 ? opts.months : yearFor(kwh, opts.seasons ?? true, opts.area);
  const used = months.reduce((s, m) => s + m, 0);
  return rankable(plans)
    .filter((plan) => passesFilters(plan, opts))
    .map((plan) => {
      const annual = annualCost(plan.pricing!, months, { includeConditional });
      return { plan, months, annual, monthly: Math.round((annual / 12) * 100) / 100, avgCents: used > 0 ? Math.round((annual / used) * 1000) / 10 : 0 };
    })
    .sort((a, b) => a.annual - b.annual || a.plan.provider.localeCompare(b.plan.provider) || a.plan.id.localeCompare(b.plan.id));
}

/** What Power to Choose puts first: lowest printed average at 1,000 kWh (its default view). */
export function ptcTopPick(plans: ClientPlan[]): ClientPlan | null {
  const r = rankable(plans).sort((a, b) => a.ptc.k1000 - b.ptc.k1000 || a.ptc.k500 - b.ptc.k500 || a.id.localeCompare(b.id));
  return r[0] ?? null;
}

/** Where a plan stops being the cheapest one, scanning usage in 10 kWh steps. */
export function cheapestRange(plans: ClientPlan[], id: string, opts: RankOpts = {}): { from: number; to: number } | null {
  let from: number | null = null, to: number | null = null;
  for (let k = 100; k <= 3000; k += 10) {
    const top = rank(plans, k, opts)[0];
    if (top?.plan.id === id) { if (from === null) from = k; to = k; }
    else if (from !== null) break;
  }
  return from === null ? null : { from, to: to! };
}

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const kwhs = (n: number) => `${n.toLocaleString("en-US")} kWh`;
const times = (n: number) => (n === 1 ? "1 month" : `${n} months`);

/**
 * One plain-English line on why a plan costs what it does over YOUR year. Every number comes from the parsed
 * label and the bill math, never from the AI's notes. Returns null when there's nothing surprising to say.
 */
export function whyLine(p: PlanPricing, months: number[], lang: Lang = "en"): string | null {
  if (lang === "es") return whyLineEs(p, months);
  const credit = p.credits.filter((c) => !c.conditional && c.minKwh > 0).sort((a, b) => b.dollars - a.dollars)[0];
  if (credit) {
    const missed = months.filter((m) => m < credit.minKwh || (credit.maxKwh !== null && m > credit.maxKwh));
    const lost = missed.length * credit.dollars;
    if (missed.length === 0) return `Its ${usd(credit.dollars)} credit needs ${kwhs(credit.minKwh)} a month — you'd get it every month.`;
    if (missed.length === 12) return `Its ${usd(credit.dollars)} credit needs ${kwhs(credit.minKwh)} a month. You'd never get it.`;
    const range = credit.maxKwh !== null && months.some((m) => m > credit.maxKwh!) ? `between ${kwhs(credit.minKwh)} and ${kwhs(credit.maxKwh)}` : `${kwhs(credit.minKwh)}`;
    return `Its ${usd(credit.dollars)} credit only kicks in at ${range}. You'd miss it ${times(missed.length)} a year — ${usd(lost)} gone.`;
  }
  const fee = [...p.usageFees].sort((a, b) => b.dollars - a.dollars)[0];
  if (fee) {
    const hit = months.filter((m) => m < fee.belowKwh).length;
    if (hit) return `It charges ${usd(fee.dollars)} in any month under ${kwhs(fee.belowKwh)}. That's ${times(hit)} a year for you.`;
  }
  if (p.energyTiers.length > 1) {
    const tiers = [...p.energyTiers].sort((a, b) => a.fromKwh - b.fromKwh);
    const top = tiers[tiers.length - 1];
    const prev = tiers[tiers.length - 2];
    const hit = months.filter((m) => m > top.fromKwh).length;
    if (hit && top.cents > prev.cents) return `Power past ${kwhs(top.fromKwh)} costs ${top.cents.toFixed(1)}¢ instead of ${prev.cents.toFixed(1)}¢. You'd go past it ${times(hit)} a year.`;
  }
  if (p.touPeriods.length) {
    const free = p.touPeriods.filter((t) => t.cents === 0).reduce((s, t) => s + t.share, 0);
    if (free > 0) return `Its price assumes ${Math.round(free * 100)}% of your power is used in its free hours. Use less then and you pay more.`;
  }
  return null;
}

const timesEs = (n: number) => (n === 1 ? "1 mes" : `${n} meses`);

/** Same rules and numbers as whyLine, in Spanish. */
function whyLineEs(p: PlanPricing, months: number[]): string | null {
  const credit = p.credits.filter((c) => !c.conditional && c.minKwh > 0).sort((a, b) => b.dollars - a.dollars)[0];
  if (credit) {
    const missed = months.filter((m) => m < credit.minKwh || (credit.maxKwh !== null && m > credit.maxKwh));
    const lost = missed.length * credit.dollars;
    if (missed.length === 0) return `Su crédito de ${usd(credit.dollars)} pide ${kwhs(credit.minKwh)} al mes — lo recibirías todos los meses.`;
    if (missed.length === 12) return `Su crédito de ${usd(credit.dollars)} pide ${kwhs(credit.minKwh)} al mes. Nunca lo recibirías.`;
    const range = credit.maxKwh !== null && months.some((m) => m > credit.maxKwh!) ? `entre ${kwhs(credit.minKwh)} y ${kwhs(credit.maxKwh)}` : `${kwhs(credit.minKwh)}`;
    return `Su crédito de ${usd(credit.dollars)} solo llega a partir de ${range}. Te lo perderías ${timesEs(missed.length)} al año — ${usd(lost)} perdidos.`;
  }
  const fee = [...p.usageFees].sort((a, b) => b.dollars - a.dollars)[0];
  if (fee) {
    const hit = months.filter((m) => m < fee.belowKwh).length;
    if (hit) return `Cobra ${usd(fee.dollars)} cualquier mes con menos de ${kwhs(fee.belowKwh)}. Para ti ${hit === 1 ? "es" : "son"} ${timesEs(hit)} al año.`;
  }
  if (p.energyTiers.length > 1) {
    const tiers = [...p.energyTiers].sort((a, b) => a.fromKwh - b.fromKwh);
    const top = tiers[tiers.length - 1];
    const prev = tiers[tiers.length - 2];
    const hit = months.filter((m) => m > top.fromKwh).length;
    if (hit && top.cents > prev.cents) return `La luz después de ${kwhs(top.fromKwh)} cuesta ${top.cents.toFixed(1)}¢ en vez de ${prev.cents.toFixed(1)}¢. Te pasarías ${timesEs(hit)} al año.`;
  }
  if (p.touPeriods.length) {
    const free = p.touPeriods.filter((t) => t.cents === 0).reduce((s, t) => s + t.share, 0);
    if (free > 0) return `Su precio supone que usas el ${Math.round(free * 100)}% de tu luz en sus horas gratis. Si usas menos en esas horas, pagas más.`;
  }
  return null;
}

/** The reveal in one object: your best plan, the state site's #1, and what picking #1 costs you a year. */
export function reveal(plans: ClientPlan[], kwh: number, opts: RankOpts = {}) {
  const ranked = rank(plans, kwh, opts);
  const best = ranked[0] ?? null;
  // the state site's #1 among the plans that pass the same filters
  const top = ptcTopPick(plans.filter((p) => p.pricing && passesFilters(p, opts)));
  const pick = top ? ranked.find((r) => r.plan.id === top.id) ?? null : null;
  const gap = best && pick ? Math.round((pick.annual - best.annual) * 100) / 100 : 0;
  return { ranked, best, pick, pickRank: pick ? ranked.indexOf(pick) + 1 : 0, gap, why: pick ? whyLine(pick.plan.pricing!, pick.months) : null };
}
