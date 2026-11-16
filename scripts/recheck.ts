/**
 * Gives every plan that didn't add up a second chance, with no network and no AI spend:
 * Power to Choose averages, the Ranchero/SoFed form-field reader, and hand-reads in data/manual/.
 * Usage: npx tsx scripts/recheck.ts
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import type { PlanRecord } from "../src/lib/plans/schema";
import { explainMismatch, rescue, tduCandidates, type ManualRead } from "../src/lib/reader/rescue";

async function main() {
  const file = "data/plans.json";
  const snap = JSON.parse(await readFile(file, "utf8")) as { counts: Record<string, number>; plans: PlanRecord[] };
  const manual = new Map<string, ManualRead>();
  for (const f of await readdir("data/manual")) {
    const m = JSON.parse(await readFile(`data/manual/${f}`, "utf8")) as ManualRead;
    manual.set(m.id, m);
  }
  const tdu = tduCandidates(snap.plans);
  for (const r of snap.plans) {
    if (r.check.status === "verified") continue;
    const tf = `data/text/${r.meta.id}.txt`;
    if (!existsSync(tf)) continue;
    const text = await readFile(tf, "utf8");
    const fix = rescue(r, text, tdu, manual.get(r.meta.id));
    if (!fix) {
      if (r.check.status === "mismatch") Object.assign(r, explainMismatch(text, r));
      console.log(`still ${r.check.status.padEnd(8)} ${r.meta.provider} — ${r.meta.planName}`);
      continue;
    }
    r.pricing = fix.pricing;
    r.read = { ...r.read, parsedBy: fix.parsedBy };
    r.check = { status: "verified", rows: fix.rows, message: fix.message, ...(fix.tduFilled ? { tduFilled: true } : {}) };
    console.log(`verified ✓ ${r.meta.provider} — ${r.meta.planName}  (${fix.parsedBy}${fix.tduFilled ? ", delivery filled" : ""})`);
  }
  snap.counts = snap.plans.reduce<Record<string, number>>((c, r) => ((c[r.check.status] = (c[r.check.status] ?? 0) + 1), c), {});
  await writeFile(file, JSON.stringify(snap, null, 1));
  console.log("counts", snap.counts);
}
main().catch((e) => { console.error(e); process.exit(1); });
