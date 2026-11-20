/**
 * Refresh the plan snapshot.
 *
 *   npm run refresh                     → DRY RUN ($0): download the state's plan list, print what changed. Writes nothing.
 *   npm run refresh -- --area dallas    → same for Dallas–Fort Worth (--area all for both)
 *   npm run refresh -- --apply          → re-read: runs scripts/ingest.ts for the area. Labels whose text didn't change
 *                                         reuse the last read (no AI cost); only new or changed labels go to the AI.
 *                                         Needs ANTHROPIC_API_KEY (use: npx tsx --env-file=.env.local scripts/refresh.ts --apply)
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { diffPlans, diffReport, needsRead } from "../src/lib/plans/diff";
import { AREAS, PTC_CSV_URL, type Area, areaPlans } from "../src/lib/plans/ptc";
import type { PlanRecord } from "../src/lib/plans/schema";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const which = args.includes("--area") ? args[args.indexOf("--area") + 1] : "houston";
const areas: Area[] = which === "all" ? ["houston", "dallas"] : [which === "dallas" ? "dallas" : "houston"];

type Snap = { builtAt: string; counts: Record<string, number>; plans: PlanRecord[] };
const load = (f: string): Snap | null => (existsSync(f) ? (JSON.parse(readFileSync(f, "utf8")) as Snap) : null);

async function main() {
  console.log(apply ? "Refresh (--apply): new or changed labels go to the AI reader.\n" : "Dry run: nothing is written and no paid API is called. Add --apply to re-read.\n");
  const csv = await (await fetch(PTC_CSV_URL, { signal: AbortSignal.timeout(60000) })).text();
  for (const area of areas) {
    const { dataFile, city } = AREAS[area];
    const before = load(dataFile);
    const now = areaPlans(csv, area);
    const d = diffPlans(before?.plans.map((p) => p.meta) ?? [], now);
    console.log(diffReport(d, city));
    console.log(`(last read: ${before ? before.builtAt : "never"})\n`);
    if (!apply) continue;
    if (!process.env.ANTHROPIC_API_KEY) { console.log("No ANTHROPIC_API_KEY, so nothing was re-read. Run with --env-file=.env.local."); continue; }
    // Always run ingest, even when the list didn't change: a provider can change a label at the same link without
    // touching the advertised prices (codex review 6). Ingest re-downloads each label and only sends the ones whose
    // text changed (sha256) to the AI, so an unchanged night costs $0 in AI.
    console.log(`${city}: checking every label's text (${needsRead(d).length} known to be new or changed)…`);
    const r = spawnSync("npx", ["tsx", "scripts/ingest.ts", "--area", area], { stdio: "inherit", env: process.env });
    if (r.status !== 0) { console.log(`${city}: ingest failed (exit ${r.status}). The old snapshot is still in git.`); continue; }
    const after = load(dataFile)!;
    const c = (s: Snap | null, k: string) => s?.counts[k] ?? 0;
    console.log(`\n${city} before → after: verified ${c(before, "verified")} → ${c(after, "verified")}, mismatch ${c(before, "mismatch")} → ${c(after, "mismatch")}, unread ${c(before, "unread")} → ${c(after, "unread")}`);
    console.log("Next: npm test (checks every verified plan again), then npx tsx scripts/headline.ts for the new headline numbers.\n");
  }
}
main().catch((e) => { console.error("Refresh failed:", e instanceof Error ? e.message : e); process.exit(1); });
