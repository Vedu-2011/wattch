import { type Lang, TRAP_LABELS } from "@/lib/i18n";
import type { Area } from "@/lib/plans/ptc";
import { type ClientPlan, rank, rankable, traps, whyLine } from "@/lib/rank";

export type TrapCard = { id: string; planName: string; provider: string; sticker: number; real: number; over: number; trap: string; why: string | null };

/**
 * Numbers for the home page, all from data/plans.json: plans read, plans with a usage trap, and the worst
 * real-vs-sticker examples at an average Houston year (1,100 kWh with seasons), one per provider.
 */
export function heroStats(plans: ClientPlan[], kwh = 1100, max = 5, lang: Lang = "en", area: Area = "houston") {
  const read = plans.filter((p) => p.pricing).length;
  const withTrap = rankable(plans).filter((p) => traps(p.pricing!).some((t) => t.tone === "over")).length;
  const ranked = rank(plans, kwh, { area });
  const cards: TrapCard[] = [];
  const seen = new Set<string>();
  const examples = ranked
    .map((r) => ({ r, used: r.months.reduce((s, m) => s + m, 0) }))
    .map(({ r, used }) => ({ r, over: r.annual - (r.plan.ptc.k1000 / 100) * used }))
    .filter(({ r, over }) => over >= 50 && traps(r.plan.pricing!).some((t) => t.tone === "over"))
    .sort((a, b) => b.over - a.over);
  for (const { r, over } of examples) {
    if (seen.has(r.plan.provider)) continue;
    seen.add(r.plan.provider);
    cards.push({
      id: r.plan.id, planName: r.plan.planName, provider: r.plan.provider,
      sticker: r.plan.ptc.k1000, real: r.avgCents, over: Math.round(over),
      trap: (() => { const t = traps(r.plan.pricing!).find((x) => x.tone === "over")!; return TRAP_LABELS[lang][t.key] ?? t.label; })(),
      why: whyLine(r.plan.pricing!, r.months, lang),
    });
    if (cards.length >= max) break;
  }
  return { total: plans.length, read, withTrap, cards };
}
