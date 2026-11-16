// Spanish walk-through: follows the links a Spanish speaker would click, from /es to the reminder page,
// and flags lines that look English (outside lang="en" blocks, which hold label text and AI notes on purpose).
// Needs the app on :3000. Screenshots → docs/screenshots/overnight-2/es-walk/. Exits 1 on any English-looking line.
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const BASE = process.env.BASE ?? "http://localhost:3000";
const OUT = fileURLToPath(new URL("../docs/screenshots/overnight-2/es-walk/", import.meta.url));
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
// common English words that never belong in our Spanish copy
const EN = /\b(the|your|you|every|month|months|bill|costs|price|Already|Change|Close|Search|Switch|Wait|Share|Remind|Home|plans? we)\b/;

const b = await chromium.launch({ executablePath: CHROME });
let bad = 0;
for (const width of [375, 1440]) {
  const pg = await b.newPage({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
  async function check(step) {
    await pg.waitForLoadState("networkidle"); await pg.waitForTimeout(400);
    const { text, names } = await pg.evaluate(() => {
      const c = document.querySelector("main").cloneNode(true);
      c.querySelectorAll("[lang=en]").forEach((e) => e.remove());
      // plan and provider names are proper nouns; they stay as the label prints them
      const names = [...document.querySelectorAll("main a, main .font-semibold, main .font-bold, main h3")].map((e) => e.innerText.trim()).filter((s) => s.length > 3 && s.length < 60);
      return { text: c.innerText, names };
    });
    const hits = text.split("\n").filter((l) => EN.test(l) && !names.some((n) => l.includes(n)));
    await pg.screenshot({ path: `${OUT}${step}-${width}.png` });
    console.log(hits.length ? "ENGLISH" : "ok     ", width, step.padEnd(8), new URL(pg.url()).pathname + new URL(pg.url()).search, hits.length ? "\n   " + hits.slice(0, 6).join("\n   ") : "");
    bad += hits.length;
  }
  await pg.goto(`${BASE}/es`); await check("1-home");
  await pg.goto(`${BASE}/wall?kwh=1100&lang=es`); await check("2-wall");
  await pg.locator('main a[href^="/plan/"]').first().click(); await pg.waitForURL(/\/plan\//); await check("3-plan");
  await pg.goto(`${BASE}/compare?a=37797&b=33633&kwh=1100&lang=es`); await check("4-compare");
  await pg.goto(`${BASE}/traps?lang=es`); await check("5-traps");
  await pg.goto(`${BASE}/remind?lang=es`); await check("6-remind");
  await pg.goto(`${BASE}/how?lang=es`); await check("7-how");
  const src = await pg.locator(`a[href^="/sources"]`).first().getAttribute("href"); // hidden in the phone header, so read the link and go
  if (src !== "/sources?lang=es") { console.log("ENGLISH LINK", src); bad++; }
  await pg.goto(BASE + src); await check("7b-sources");
  await pg.goto(`${BASE}/wall?kwh=1100&area=dallas&lang=es`); await check("8-dallas");
  await pg.close();
}
await b.close();
process.exit(bad ? 1 : 0);
