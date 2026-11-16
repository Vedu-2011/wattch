// Every page check in one go (needs the app running: `npm run build && npx next start -p 3000`).
// axe (accessibility, 25 pages), es-walk (Spanish click-through + screen-reader labels), widths (320 + 1920 overflow),
// meta-check (titles, descriptions, preview cards, sitemap, robots). Prints one line per check; exits 1 if any fails.
// Usage: node scripts/check-all.mjs   (BASE=https://… to check a deployed copy)
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = (f) => fileURLToPath(new URL(f, import.meta.url));
const checks = [
  ["axe (accessibility)", "axe.mjs"],
  ["es-walk (Spanish)", "es-walk.mjs"],
  ["widths (320 + 1920)", "widths.mjs"],
  ["meta-check (titles, previews, sitemap)", "meta-check.mjs"],
];

const BASE = process.env.BASE ?? "http://localhost:3000";
try { await fetch(BASE, { signal: AbortSignal.timeout(5000) }); } catch {
  console.log(`The app isn't answering at ${BASE}. Start it first: npm run build && npx next start -p 3000`);
  process.exit(1);
}

let failed = 0;
for (const [name, file] of checks) {
  const t = Date.now();
  const r = spawnSync(process.execPath, [here(file)], { encoding: "utf8", env: process.env });
  const out = (r.stdout ?? "") + (r.stderr ?? "");
  const ok = r.status === 0;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}  (${((Date.now() - t) / 1000).toFixed(0)} s)`);
  if (!ok) console.log(out.split("\n").filter((l) => l.trim() && !/^ok\b|\sok\s*$/.test(l)).slice(0, 12).map((l) => "      " + l).join("\n"));
}
console.log(failed ? `\n${failed} check(s) failed.` : "\nAll checks passed.");
process.exit(failed ? 1 : 0);
