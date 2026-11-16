/**
 * Reads every Houston plan's fine print and writes data/plans.json.
 * Usage: ANTHROPIC_API_KEY=... [ANAKIN_API_KEY=...] npx tsx scripts/ingest.ts [--limit N] [--only id,id]
 * Re-runs are cheap: a plan whose fine print hasn't changed (same sha256) is not read again.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { houstonPlans, PTC_CSV_URL } from "../src/lib/plans/ptc";
import { anakinRead, fetchEfl } from "../src/lib/reader/fetchEfl";
import { fillTdu, parseEfl, READER_MODEL } from "../src/lib/reader/parse";
import { labelCheck } from "../src/lib/bill";
import type { PlanRecord } from "../src/lib/plans/schema";

const args = process.argv.slice(2);
const limit = args.includes("--limit") ? Number(args[args.indexOf("--limit") + 1]) : Infinity;
let only = args.includes("--only") ? new Set(args[args.indexOf("--only") + 1].split(",")) : null;
const apiKey = process.env.ANTHROPIC_API_KEY ?? "";
const anakinKey = process.env.ANAKIN_API_KEY;

async function main() {
  const csv = await (await fetch(PTC_CSV_URL, { signal: AbortSignal.timeout(60000) })).text();
  if (args.includes("--redo-failed") && existsSync("data/plans.json")) {
    const prev = JSON.parse(await readFile("data/plans.json", "utf8")).plans as PlanRecord[];
    only = new Set(prev.filter((p) => p.check.status !== "verified").map((p) => p.meta.id));
  }
  const metas = houstonPlans(csv).filter((m) => !only || only.has(m.id)).slice(0, limit);
  const out = "data/plans.json";
  const old: Record<string, PlanRecord> = existsSync(out)
    ? Object.fromEntries((JSON.parse(await readFile(out, "utf8")).plans as PlanRecord[]).map((p) => [p.meta.id, p]))
    : {};
  await mkdir("data/text", { recursive: true });
  console.log(`${metas.length} Houston plans on Power to Choose right now`);
  let inT = 0, outT = 0, done = 0;
  const results: PlanRecord[] = [];
  const queue = [...metas];
  async function worker() {
    for (let m = queue.shift(); m; m = queue.shift()) {
      const fetchedAt = new Date().toISOString();
      let rec: PlanRecord;
      try {
        let f = await fetchEfl(m.eflUrl, { anakinKey });
        await writeFile(`data/text/${m.id}.txt`, f.text);
        const prev = old[m.id];
        if (prev && prev.read.sha256 === f.sha256 && prev.pricing && !args.includes("--force")) {
          rec = { ...prev, meta: m };
        } else if (!apiKey) {
          rec = { meta: m, pricing: null, read: { fetchedAt, via: f.via, sha256: f.sha256, parsedBy: "none", readMs: f.ms },
            check: { status: "unread", rows: [], message: "Fetched, not read yet." } };
        } else {
          const t0 = Date.now();
          let r = await parseEfl(apiKey, f.text);
          if (!r.pricing && f.via === "direct" && /aren't readable/.test(r.message)) {
            // e.g. numbers inside PDF form fields: let Anakin.io render the page like a browser and read that instead
            try {
              f = await anakinRead(m.eflUrl, Date.now(), anakinKey);
              await writeFile(`data/text/${m.id}.txt`, f.text);
              const r2 = await parseEfl(apiKey, f.text);
              r = { ...r2, inputTokens: r.inputTokens + r2.inputTokens, outputTokens: r.outputTokens + r2.outputTokens };
            } catch { /* keep the first result */ }
          }
          inT += r.inputTokens; outT += r.outputTokens;
          rec = { meta: m, pricing: r.pricing, read: { fetchedAt, via: f.via, sha256: f.sha256, parsedBy: READER_MODEL, readMs: f.ms + (Date.now() - t0) },
            check: { status: r.pricing ? (r.ok ? "verified" : "mismatch") : "unread", rows: r.rows, message: r.message } };
        }
      } catch (e) {
        rec = { meta: m, pricing: null, read: { fetchedAt, via: "direct", sha256: "", parsedBy: "none", readMs: 0 },
          check: { status: "unread", rows: [], message: e instanceof Error ? e.message : "Couldn't read this one." } };
      }
      results.push(rec);
      done++;
      console.log(`${String(done).padStart(3)}/${metas.length} ${rec.check.status.padEnd(8)} ${rec.read.via.padEnd(6)} ${m.provider} — ${m.planName}${rec.check.status !== "verified" ? "  · " + rec.check.message : ""}`);
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker));
  // labels that don't print delivery charges: try the CenterPoint charges other verified labels print
  const pairs = new Map<string, { cents: number; monthly: number; n: number }>();
  for (const r of [...results, ...Object.values(old)]) {
    if (r.check.status !== "verified" || !r.pricing || r.check.tduFilled || !r.pricing.tduMonthlyDollars) continue;
    const k = `${r.pricing.tduCentsPerKwh}|${r.pricing.tduMonthlyDollars}`;
    const e = pairs.get(k) ?? { cents: r.pricing.tduCentsPerKwh, monthly: r.pricing.tduMonthlyDollars, n: 0 };
    e.n++; pairs.set(k, e);
  }
  const candidates = [...pairs.values()].sort((a, b) => b.n - a.n).slice(0, 3);
  for (const r of results) {
    if (r.check.status !== "mismatch" || !r.pricing) continue;
    const fix = fillTdu(r.pricing, candidates);
    if (fix) {
      r.pricing = fix.pricing;
      r.check = { status: "verified", rows: fix.rows, tduFilled: true,
        message: `This label doesn't print delivery charges. With CenterPoint's charges from other labels (${fix.pricing.tduCentsPerKwh}¢/kWh + $${fix.pricing.tduMonthlyDollars.toFixed(2)}/mo), all 3 averages match.` };
      console.log(`tdu-filled ✓ ${r.meta.provider} — ${r.meta.planName}`);
    }
  }
  void labelCheck;
  // keep plans we didn't touch this run (when using --only/--limit)
  for (const [id, p] of Object.entries(old)) if (!results.find((r) => r.meta.id === id) && (only || limit !== Infinity)) results.push(p);
  results.sort((a, b) => a.meta.provider.localeCompare(b.meta.provider) || a.meta.planName.localeCompare(b.meta.planName));
  const counts = results.reduce<Record<string, number>>((c, r) => ((c[r.check.status] = (c[r.check.status] ?? 0) + 1), c), {});
  await writeFile(out, JSON.stringify({ builtAt: new Date().toISOString(), source: PTC_CSV_URL, model: READER_MODEL, counts, plans: results }, null, 1));
  console.log("counts", counts, `tokens in ${inT} out ${outT}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
