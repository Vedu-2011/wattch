// Screen-reader structure check, every main page in English, Spanish and Dallas:
// - two visible links with the same spoken name must go to the same place (else a link list is useless),
// - headings don't skip a level (h1 → h2 → h3),
// - <html lang> matches the page's language (so Spanish is read with a Spanish voice).
// Needs the app on :3000. Exits 1 on any problem.
import { chromium } from "playwright-core";

const BASE = process.env.BASE ?? "http://localhost:3000";
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const pages = [
  "/", "/es", "/wall?kwh=1100", "/wall?kwh=1100&lang=es", "/wall?kwh=1100&area=dallas",
  "/plan/33633?kwh=1100", "/plan/33633?kwh=1100&lang=es", "/plan/31967?area=dallas&kwh=1100",
  "/compare?a=37797&b=33633&kwh=1100", "/compare?a=37797&b=33633&kwh=1100&lang=es",
  "/traps", "/traps?lang=es", "/traps?area=dallas", "/how", "/how?lang=es", "/sources", "/sources?lang=es", "/remind", "/remind?lang=es",
];

const b = await chromium.launch({ executablePath: CHROME });
const pg = await b.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
let bad = 0;
for (const u of pages) {
  await pg.goto(BASE + u, { waitUntil: "networkidle" });
  await pg.waitForTimeout(600);
  const r = await pg.evaluate(() => {
    const name = (e) => (e.getAttribute("aria-label") || e.innerText || "").replace(/\s+/g, " ").trim();
    const seen = new Map();
    for (const a of document.querySelectorAll("a[href]")) {
      if (!a.offsetParent) continue;
      const n = name(a), h = a.getAttribute("href");
      if (!seen.has(n)) seen.set(n, new Set());
      seen.get(n).add(h);
    }
    const dup = [...seen].filter(([, hs]) => hs.size > 1).map(([n, hs]) => `${hs.size}× "${n.slice(0, 40)}"`);
    const levels = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter((h) => h.offsetParent || h.closest(".sr-only")).map((h) => +h.tagName[1]);
    const skips = levels.filter((l, i) => i > 0 && l > levels[i - 1] + 1).length + (levels.length && levels[0] !== 1 ? 1 : 0);
    return { dup, skips, levels: levels.join(""), lang: document.documentElement.lang };
  });
  const wantLang = /lang=es|^\/es/.test(u) ? "es" : "en";
  const problems = [...r.dup, ...(r.skips ? [`heading levels skip (${r.levels})`] : []), ...(r.lang !== wantLang ? [`<html lang="${r.lang}">`] : [])];
  console.log(problems.length ? "PROBLEM" : "ok     ", u, problems.join(" | "));
  bad += problems.length ? 1 : 0;
}
await b.close();
process.exit(bad ? 1 : 0);
