// Accessibility check: runs axe-core on every page in headless Chrome (server must be running on :3000).
// Usage: node scripts/axe.mjs [baseUrl]   — prints serious/critical issues per page; exit 1 if any.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { chromium } from "playwright-core";

const require = createRequire(import.meta.url);
const axeSrc = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const base = process.argv[2] ?? "http://localhost:3000";
const pages = ["/", "/es", "/wall?kwh=1100", "/wall?kwh=1100&lang=es", "/plan/33633?kwh=1100", "/plan/36599?kwh=1100", "/compare?a=37797&b=33633&kwh=1100", "/traps", "/demo", "/how", "/sources", "/wall?kwh=1100&area=dallas", "/remind?end=2027-03-14", "/remind?end=2020-01-01", "/remind?end=2027-03-14&lang=es", "/traps?area=dallas", "/plan/33633?kwh=1100&lang=es", "/plan/17283?kwh=1100&area=dallas&lang=es", "/compare?a=37797&b=33633&kwh=1100&lang=es", "/traps?lang=es", "/how?lang=es", "/sources?lang=es", "/no-such-page"];
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
let bad = 0;
for (const w of [375, 1440]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 }, reducedMotion: "reduce" });
  for (const path of pages) {
    await page.goto(base + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    await page.addScriptTag({ content: axeSrc });
    const res = await page.evaluate(async () => (await window.axe.run(document, { resultTypes: ["violations"] })).violations
      .map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, help: v.help, eg: v.nodes[0]?.target?.join(" ") })));
    const serious = res.filter((v) => v.impact === "serious" || v.impact === "critical");
    bad += serious.length;
    console.log(w, path, serious.length ? "" : "ok", res.map((v) => `${v.impact}:${v.id}×${v.n} (${v.eg})`).join(" | "));
  }
  await page.close();
}
await browser.close();
process.exit(bad ? 1 : 0);
