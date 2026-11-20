/**
 * The demo flow, start to finish, on an iPhone and a 1920 projector: home → usage → reveal → plan page → compare →
 * Español → Dallas. Saves screenshots to docs/gallery-final/ and fails on any console error or 4xx/5xx.
 *   npm run build && npx next start -p 3000   then   node scripts/demo-flow.mjs
 */
import { chromium, devices } from "playwright-core";
const D = "docs/gallery-final";
let failed = 0;
const b = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
for (const [tag, ctxOpts] of [["iphone", { ...devices["iPhone 13"] }], ["1920", { viewport: { width: 1920, height: 1080 } }]]) {
  const ctx = await b.newContext(ctxOpts); const pg = await ctx.newPage();
  const errs = []; pg.on("pageerror", (e) => errs.push(e.message)); pg.on("console", (m) => m.type() === "error" && errs.push(m.text() + " @ " + m.location().url + " on " + pg.url()));
  const t0 = Date.now(); pg.on("response", (r) => r.status() >= 400 && errs.push(`HTTP ${r.status()} ${r.url()}`)); const shot = async (n) => { await pg.screenshot({ path: `${D}/${tag}-${n}.png` }); console.log(tag, n, `${((Date.now() - t0) / 1000).toFixed(1)}s`); };
  const tap = (l) => (tag === "iphone" ? l.tap() : l.click());
  await pg.goto("http://localhost:3000/", { waitUntil: "networkidle" }); await shot("1-home");
  await tap(pg.getByRole("button", { name: /Average home/ }));
  await tap(pg.getByRole("button", { name: /Read every plan/ }));
  await pg.waitForURL(/wall/); await shot("2-reading");
  await pg.waitForFunction(() => /\$378/.test(document.body.innerText), null, { timeout: 30000 }); await pg.waitForTimeout(1500); await shot("3-reveal");
  await tap(pg.getByRole("link", { name: /See the math/ }).first()); await pg.waitForURL(/plan\//); await pg.waitForLoadState("networkidle"); await shot("4-plan");
  await pg.goBack(); await pg.waitForLoadState("networkidle");
  await tap(pg.getByRole("link", { name: /Side by side/ }).first()); await pg.waitForURL(/compare/); await pg.waitForLoadState("networkidle"); await shot("5-compare");
  await tap(pg.getByRole("link", { name: /^Español$/ }).first()); await pg.waitForURL(/lang=es/); await pg.waitForLoadState("networkidle"); await shot("6-espanol");
  await pg.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await tap(pg.getByRole("radio", { name: /Dallas/ }).first()); await pg.waitForTimeout(500); await shot("7-dallas-home");
  await tap(pg.getByRole("button", { name: /Average home/ })); await tap(pg.getByRole("button", { name: /Read every plan/ }));
  await pg.waitForURL(/area=dallas/); await pg.waitForFunction(() => /\$530/.test(document.body.innerText), null, { timeout: 30000 }); await pg.waitForTimeout(1500); await shot("8-dallas-reveal");
  // a plan that left Power to Choose says so on its page (data/delisted.json), in both languages
  for (const [q, re] of [["", /No longer on Power to Choose/], ["&lang=es", /Ya no está en Power to Choose/]]) {
    await pg.goto(`http://localhost:3000/plan/39294?kwh=1100${q}`, { waitUntil: "networkidle" });
    if (!re.test(await pg.locator("main").innerText())) errs.push(`delisted note missing${q}`);
  }
  await shot("9-left-the-list");
  console.log(tag, "errors:", errs.length ? errs.slice(0, 3).join(" | ") : "none");
  failed += errs.length;
  await ctx.close();
}
await b.close();
if (failed) { console.log("FAIL"); process.exit(1); }
console.log("Demo flow OK");
