/**
 * Which plans Wattch read have since left Power to Choose. Free: downloads the state's plan list (no AI, no Anakin).
 *
 *   npx tsx scripts/delisted.ts    → writes data/delisted.json
 *
 * A plan in that file keeps its page (people may have its link), says plainly that it's no longer listed, and is never
 * ranked or picked as "the plan the state site lists first". A full refresh (scripts/refresh.ts --apply) replaces the
 * snapshot, after which this file should be rebuilt.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { diffPlans } from "../src/lib/plans/diff";
import { AREAS, PTC_CSV_URL, type Area, areaPlans } from "../src/lib/plans/ptc";
import type { PlanRecord } from "../src/lib/plans/schema";

async function main() {
  const csv = await (await fetch(PTC_CSV_URL, { signal: AbortSignal.timeout(60000) })).text();
  const out: { checkedAt: string; houston: string[]; dallas: string[] } = { checkedAt: new Date().toISOString(), houston: [], dallas: [] };
  for (const area of Object.keys(AREAS) as Area[]) {
    const file = AREAS[area].dataFile;
    if (!existsSync(file)) continue;
    const plans = (JSON.parse(readFileSync(file, "utf8")) as { plans: PlanRecord[] }).plans;
    const now = areaPlans(csv, area);
    if (now.length < 50) throw new Error(`Power to Choose list for ${area} looks broken (${now.length} plans); not writing.`);
    const d = diffPlans(plans.map((p) => p.meta), now);
    out[area] = d.removed.map((m) => m.id).sort();
    console.log(`${AREAS[area].city}: ${out[area].length} of ${plans.length} plans no longer listed: ${d.removed.map((m) => `${m.planName} (${m.provider})`).join("; ")}`);
  }
  writeFileSync("data/delisted.json", JSON.stringify(out, null, 2) + "\n");
  console.log("Wrote data/delisted.json");
}
main().catch((e) => { console.error("delisted failed:", e instanceof Error ? e.message : e); process.exit(1); });
