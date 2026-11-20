// Width check: every page in English and Spanish at 320px (smallest phones) and 1920px (projector).
// Flags sideways scrolling, content sticking out past the screen edge, and text cut off sideways.
// Needs the app on :3000. Exits 1 on any problem. (Tiny reader-replay tiles clamp long names on purpose: skipped.)
import { chromium } from "playwright-core";

const BASE = process.env.BASE ?? "http://localhost:3000";
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const pages = [
  "/", "/es", "/wall?kwh=1100", "/wall?kwh=1100&lang=es", "/wall?kwh=1100&area=dallas&lang=es",
  "/plan/33633?kwh=1100", "/plan/39294?kwh=1100", "/plan/39294?kwh=1100&lang=es", "/compare?a=39294&b=37797&kwh=1100&lang=es", "/plan/33633?kwh=1100&lang=es", "/compare?a=37797&b=33633&kwh=1100", "/compare?a=37797&b=33633&kwh=1100&lang=es",
  "/traps", "/traps?lang=es", "/remind", "/remind?lang=es", "/how", "/how?lang=es", "/sources", "/sources?lang=es", "/no-such-page?lang=es",
  // Dallas pair (best vs the state site's #1) and a visitor's own 12 months
  "/compare?a=17283&b=33631&kwh=1100&lang=es", "/plan/24977?kwh=1100&lang=es", "/wall?kwh=1100&m=700.650.700.850.1200.1500.1700.1800.1400.1000.750.700&lang=es",
];

const b = await chromium.launch({ executablePath: CHROME });
let bad = 0;
for (const width of [320, 1920]) {
  for (const u of pages) {
    const pg = await b.newPage({ viewport: { width, height: width === 320 ? 640 : 1080 }, reducedMotion: "reduce" });
    await pg.goto(BASE + u, { waitUntil: "networkidle" });
    await pg.waitForTimeout(500);
    const r = await pg.evaluate(() => {
      const W = document.documentElement.clientWidth;
      const sideways = document.documentElement.scrollWidth > W + 1;
      const out = [...document.querySelectorAll("body *")].filter((e) => {
        const c = e.getBoundingClientRect();
        if (!c.width || e.closest("[class*=overflow-x], svg, table, .sr-only")) return false;
        return c.right > W + 1 || c.left < -1;
      }).slice(0, 3).map((e) => `${e.tagName} «${(e.innerText || "").slice(0, 30)}»`);
      const cut = [...document.querySelectorAll("main h1, main h2, main p, main button, main a")].filter((e) => {
        const cls = String(e.className);
        return e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow !== "visible" && !cls.includes("truncate") && !cls.includes("line-clamp");
      }).slice(0, 3).map((e) => `${e.tagName} «${e.innerText.slice(0, 30)}»`);
      return { sideways, out, cut };
    });
    const problem = r.sideways || r.out.length || r.cut.length;
    console.log(problem ? "BAD" : "ok ", String(width).padStart(4), u, problem ? JSON.stringify(r) : "");
    bad += problem ? 1 : 0;
    await pg.close();
  }
}
await b.close();
process.exit(bad ? 1 : 0);
