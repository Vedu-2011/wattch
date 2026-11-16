/**
 * Prints the reveal numbers the demo, deck and Devpost quote, straight from the code + the data files.
 * The headline itself (1,100 kWh, real seasons, autopay counted) comes from src/lib/headline.ts — the same function
 * the demo page uses. Other usages are printed for reference.
 * Usage: npx tsx scripts/headline.ts [kWh]   (default 1,100)
 */
import { readFileSync } from "node:fs";
import { HEADLINE_KWH, headline, toClientPlan } from "../src/lib/headline";
import { AREAS, type Area } from "../src/lib/plans/ptc";
import type { PlanRecord } from "../src/lib/plans/schema";
import { reveal } from "../src/lib/rank";

const kwh = Number(process.argv[2] ?? HEADLINE_KWH);
for (const area of Object.keys(AREAS) as Area[]) {
  const snap = JSON.parse(readFileSync(AREAS[area].dataFile, "utf8")) as { plans: PlanRecord[]; counts: Record<string, number>; builtAt: string };
  const plans = snap.plans.map(toClientPlan);
  console.log(`\n=== ${AREAS[area].city} · data built ${snap.builtAt} · counts`, snap.counts);
  const runs = kwh === HEADLINE_KWH
    ? [{ name: "HEADLINE (src/lib/headline.ts)", r: headline(plans, area) }, { name: "same usage every month", r: reveal(plans, kwh, { seasons: false, area }) }]
    : [{ name: "with seasons", r: reveal(plans, kwh, { seasons: true, area }) }, { name: "same usage every month", r: reveal(plans, kwh, { seasons: false, area }) }];
  for (const { name, r } of runs) {
    console.log(`\n${kwh} kWh · ${name} · ${r.ranked.length} ranked`);
    console.log(`  best: ${r.best?.plan.provider} — ${r.best?.plan.planName} $${r.best?.annual}/yr`);
    console.log(`  state site's #1: ${r.pick?.plan.provider} — ${r.pick?.plan.planName} ranks #${r.pickRank}, $${r.pick?.annual}/yr, gap $${Math.round(r.gap)}/yr`);
    console.log(`  why: ${r.why}`);
  }
}
