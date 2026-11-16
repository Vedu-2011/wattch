import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
// node scripts/gallery.mjs  (run from the repo root, app on :3000, Google Chrome installed)
const out = fileURLToPath(new URL("../docs/gallery", import.meta.url));
const B = "http://localhost:3000";
const b = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const shot = (n) => pg.screenshot({ path: `${out}/${n}.png` });
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
await b.close();
