/**
 * Prints the reveal numbers the demo, deck and Devpost quote, straight from the code + data/plans.json.
 * Usage: npx tsx scripts/headline.ts [kWh]   (default 1,100)
 */
import { readFileSync } from "node:fs";
import type { PlanRecord } from "../src/lib/plans/schema";
import { reveal, type ClientPlan } from "../src/lib/rank";

const kwh = Number(process.argv[2] ?? 1100);
const snap = JSON.parse(readFileSync("data/plans.json", "utf8")) as { plans: PlanRecord[]; counts: Record<string, number>; builtAt: string };
const plans: ClientPlan[] = snap.plans.map((r) => ({
  id: r.meta.id, provider: r.meta.provider, planName: r.meta.planName, rateType: r.meta.rateType,
  renewablePct: r.meta.renewablePct, prepaid: r.meta.prepaid, timeOfUse: r.meta.timeOfUse,
  eflUrl: r.meta.eflUrl, enrollUrl: r.meta.enrollUrl, ptc: r.meta.ptc,
  status: r.check.status, via: r.read.via, fetchedAt: r.read.fetchedAt, readMs: r.read.readMs,
  message: r.check.message, rows: r.check.rows, pricing: r.pricing,
}));
console.log(`data built ${snap.builtAt} · counts`, snap.counts);
for (const opts of [{ seasons: true }, { seasons: false }]) {
  const r = reveal(plans, kwh, opts);
  console.log(`\n${kwh} kWh ${JSON.stringify(opts)} · ${r.ranked.length} ranked`);
  console.log(`  best: ${r.best?.plan.provider} — ${r.best?.plan.planName} $${r.best?.annual}/yr`);
  console.log(`  state site's #1: ${r.pick?.plan.provider} — ${r.pick?.plan.planName} ranks #${r.pickRank}, $${r.pick?.annual}/yr, gap $${Math.round(r.gap)}/yr`);
  console.log(`  why: ${r.why}`);
}
