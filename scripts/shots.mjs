// Full-page screenshots of every page at phone / laptop / projector widths, using the installed Google Chrome.
// Usage: node scripts/shots.mjs <folder under docs/screenshots> [base url]
import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

const out = `docs/screenshots/${process.argv[2] ?? "latest"}`;
const base = process.argv[3] ?? "http://localhost:3000";
const pages = {
  home: "/", wall: "/wall?kwh=1100", "wall-flat": "/wall?kwh=1100&flat=1", "plan-apgas": "/plan/33633?kwh=1100",
  "plan-txu": "/plan/36599?kwh=1100", how: "/how", sources: "/sources",
};
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
for (const w of [375, 1440, 1920]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w === 375 ? 812 : 1000 }, reducedMotion: "reduce", deviceScaleFactor: w === 375 ? 2 : 1 });
  const page = await ctx.newPage();
  for (const [name, path] of Object.entries(pages)) {
    await page.goto(base + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    await page.screenshot({ path: `${out}/${name}-${w}.png`, fullPage: true });
    console.log(`${out}/${name}-${w}.png${overflow > 0 ? `  ⚠ ${overflow}px sideways scroll` : ""}`);
  }
  await ctx.close();
}
await browser.close();
