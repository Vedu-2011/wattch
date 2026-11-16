/** Prints the top plans at a few usages (a quick sanity check after data changes). Usage: npx tsx scripts/top.ts */
import raw from "../data/plans.json";
import type { PlanRecord } from "../src/lib/plans/schema";
import { ptcTopPick, rank, type ClientPlan } from "../src/lib/rank";

const recs = (raw as unknown as { plans: PlanRecord[] }).plans;
const plans: ClientPlan[] = recs.map((r) => ({
  id: r.meta.id, provider: r.meta.provider, planName: r.meta.planName, rateType: r.meta.rateType, renewablePct: r.meta.renewablePct,
  prepaid: r.meta.prepaid, timeOfUse: r.meta.timeOfUse, eflUrl: r.meta.eflUrl, enrollUrl: r.meta.enrollUrl, ptc: r.meta.ptc,
  status: r.check.status, via: r.read.via, fetchedAt: r.read.fetchedAt, readMs: r.read.readMs, message: r.check.message, rows: r.check.rows, pricing: r.pricing,
}));
for (const k of [500, 1000, 1200, 2000]) {
  console.log(`\n${k} kWh`);
  for (const r of rank(plans, k).slice(0, 5)) console.log(`  $${r.annual}/yr  ${r.plan.provider} — ${r.plan.planName} · ${r.plan.rateType} · ${r.plan.pricing!.termMonths} mo`);
}
const t = ptcTopPick(plans);
console.log("\nPower to Choose #1 at 1,000 kWh:", t?.provider, "—", t?.planName, t?.ptc);
console.log("rate types:", [...new Set(plans.map((p) => p.rateType))].join(", "));
