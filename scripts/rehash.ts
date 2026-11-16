/**
 * Re-fetches every plan's fine print (free: direct download, no AI) and stores the real sha256 when the label text
 * is exactly what Wattch read. Fixes records hashed after the PDF reader had emptied the buffer.
 * Labels that changed since the read are listed, not touched. Usage: npx tsx scripts/rehash.ts
 */
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import type { PlanRecord } from "../src/lib/plans/schema";
import { fetchEfl } from "../src/lib/reader/fetchEfl";

const EMPTY = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

async function main() {
  const file = "data/plans.json";
  const snap = JSON.parse(await readFile(file, "utf8")) as { plans: PlanRecord[] };
  const todo = snap.plans.filter((r) => r.read.sha256 === EMPTY && r.read.via === "direct" && existsSync(`data/text/${r.meta.id}.txt`));
  console.log(`${todo.length} plans to re-hash`);
  let fixed = 0;
  const changed: string[] = [];
  const queue = [...todo];
  async function worker() {
    for (let r = queue.shift(); r; r = queue.shift()) {
      try {
        const f = await fetchEfl(r.meta.eflUrl, { timeoutMs: 25000 });
        const old = await readFile(`data/text/${r.meta.id}.txt`, "utf8");
        if (f.via === "direct" && f.text === old) { r.read.sha256 = f.sha256; fixed++; }
        else changed.push(`${r.meta.id} ${r.meta.provider} — ${r.meta.planName}`);
      } catch (e) {
        changed.push(`${r.meta.id} ${r.meta.provider} — ${r.meta.planName} (couldn't fetch: ${e instanceof Error ? e.message : e})`);
      }
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker));
  await writeFile(file, JSON.stringify(snap, null, 1));
  console.log(`re-hashed ${fixed}; changed or unreachable ${changed.length}:`);
  for (const c of changed) console.log("  " + c);
}
main().catch((e) => { console.error(e); process.exit(1); });
