import type { Metadata } from "next";
import { Demo, type DemoData } from "@/components/Demo";
import { heroStats } from "@/lib/hero";
import { clientPlans, snapshotInfo } from "@/lib/plans/data";
import { reveal } from "@/lib/rank";

export const metadata: Metadata = { title: "Wattch — demo", robots: { index: false } };

const KWH = 1100;

/** A scripted walk-through for the video and the live pitch. Every number is computed here from data/plans.json. */
export default function DemoPage() {
  const plans = clientPlans();
  const r = reveal(plans, KWH, { seasons: true });
  const hero = heroStats(plans);
  const pick = r.pick!, best = r.best!;
  const credit = pick.plan.pricing!.credits.filter((c) => !c.conditional && c.minKwh > 0).sort((a, b) => b.dollars - a.dollars)[0];
  const data: DemoData = {
    kwh: KWH,
    total: snapshotInfo.total,
    verified: snapshotInfo.counts.verified ?? 0,
    withTrap: hero.withTrap,
    ranked: r.ranked.length,
    pick: { id: pick.plan.id, name: pick.plan.planName, provider: pick.plan.provider, sticker: pick.plan.ptc.k1000, annual: pick.annual, real: pick.avgCents, months: pick.months },
    best: { id: best.plan.id, name: best.plan.planName, provider: best.plan.provider, sticker: best.plan.ptc.k1000, annual: best.annual, real: best.avgCents },
    pickRank: r.pickRank,
    gap: r.gap,
    why: r.why,
    creditLine: credit?.minKwh ?? null,
  };
  return <Demo d={data} />;
}
