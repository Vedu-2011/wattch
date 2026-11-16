import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
// node scripts/gallery.mjs [7,8]  (run from the repo root, app on :3000, Google Chrome installed; numbers = only those shots)
const out = fileURLToPath(new URL("../docs/gallery", import.meta.url));
const B = "http://localhost:3000";
const b = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const only = process.argv[2]?.split(",");
const want = (n) => !only || only.includes(n.split("-")[0]);
const shot = (n) => pg.screenshot({ path: `${out}/${n}.png` });
if (!only || only.some((n) => Number(n) <= 6)) {
await pg.goto(B + "/"); await pg.waitForTimeout(1500); await shot("1-home");
await pg.goto(B + "/wall?kwh=1100"); await pg.waitForTimeout(4000); await shot("2-reading-every-plan");
await pg.waitForTimeout(9000);
const reveal = pg.locator("text=more a year").first();
if (await reveal.count()) await reveal.scrollIntoViewIfNeeded();
await pg.waitForTimeout(2500); await pg.evaluate(() => window.scrollBy(0, -120)); await pg.waitForTimeout(500); await shot("3-the-reveal");
await pg.goto(B + "/plan/33633?kwh=1100"); await pg.waitForTimeout(1500);
const credit = pg.locator("li", { hasText: "credit" }).first();
const label = pg.locator("text=The fine print").first();
if (await label.count()) { await label.scrollIntoViewIfNeeded(); await pg.evaluate(() => window.scrollBy(0, -380)); }
if (await credit.count()) await credit.hover();
await pg.waitForTimeout(600); await shot("4-fine-print-proof");
await pg.goto(B + "/compare?a=37797&b=33633&kwh=1100"); await pg.waitForTimeout(1500); await shot("5-side-by-side");
await pg.goto(B + "/traps"); await pg.waitForTimeout(1500); await shot("6-trap-guide");
}
if (want("7-x")) {
  // Dallas–Fort Worth: the same plan, a different city's year
  await pg.goto(B + "/wall?kwh=1100&area=dallas"); await pg.waitForTimeout(13000);
  const r = pg.locator("text=more a year").first();
  if (await r.count()) await r.scrollIntoViewIfNeeded();
  await pg.waitForTimeout(2500); await pg.evaluate(() => window.scrollBy(0, -120)); await pg.waitForTimeout(500); await shot("7-dallas-fort-worth");
}
if (want("8-x")) {
  // the plan page in Spanish: bill lines explained, and the questions to ask
  await pg.goto(B + "/plan/33633?kwh=1100&lang=es"); await pg.waitForTimeout(1500);
  const bill = pg.locator("h2", { hasText: "Tu factura con" }).first();
  if (await bill.count()) { await bill.scrollIntoViewIfNeeded(); await pg.evaluate(() => window.scrollBy(0, -140)); }
  await pg.waitForTimeout(600); await shot("8-en-espanol");
}
await b.close();
