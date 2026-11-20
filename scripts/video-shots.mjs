/**
 * Raw 1920×1080 screen captures for the demo video, one clip per shot in docs/SCRIPT.md (list: docs/SHOTS.md).
 * Each clip is recorded in a fresh browser (so the results replay plays), with a visible cursor dot for hovers/clicks.
 *
 *   npm run build && npx next start -p 3000      then      node scripts/video-shots.mjs [shot ids…]
 *
 * Writes video/raw/<id>.webm, plus .mp4 when ffmpeg is on the PATH (video/ is gitignored).
 * These are backups and editing references; a QuickTime screen recording of the same steps is sharper.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, renameSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";

const BASE = process.env.BASE ?? "http://localhost:3000";
// Playwright's headless shell records the full 1920×1080; desktop Chrome on a Mac cuts the frame at the real screen's
// height (a gray band at the bottom), so it's only the fallback.
const SHELL = join(homedir(), "Library/Caches/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-mac-arm64/chrome-headless-shell");
const CHROME = existsSync(SHELL) ? SHELL : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = "video/raw";
const SIZE = { width: 1920, height: 1080 };

// a soft yellow dot that follows the mouse and pulses on click (Playwright's video has no cursor)
const CURSOR = () => {
  addEventListener("DOMContentLoaded", () => {
    const d = document.createElement("div");
    d.style.cssText = "position:fixed;z-index:2147483647;width:28px;height:28px;margin:-14px 0 0 -14px;border-radius:50%;background:rgba(255,200,40,.55);box-shadow:0 0 0 3px rgba(30,25,20,.55);pointer-events:none;left:-50px;top:-50px;transition:transform .12s";
    document.body.appendChild(d);
    addEventListener("mousemove", (e) => { d.style.left = e.clientX + "px"; d.style.top = e.clientY + "px"; }, true);
    addEventListener("mousedown", () => { d.style.transform = "scale(.7)"; }, true);
    addEventListener("mouseup", () => { d.style.transform = ""; }, true);
  });
};

const wait = (pg, ms) => pg.waitForTimeout(ms);
/** move the dot to an element slowly, then click it */
async function point(pg, loc, { click = true, pause = 600 } = {}) {
  await loc.scrollIntoViewIfNeeded();
  const b = await loc.boundingBox();
  if (!b) throw new Error("not visible: " + loc);
  await pg.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 25 });
  await wait(pg, pause);
  if (click) await pg.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
}
/** scroll smoothly by px over ms */
async function glide(pg, px, ms = 2500) {
  const steps = Math.max(1, Math.round(ms / 40));
  for (let i = 0; i < steps; i++) { await pg.mouse.wheel(0, px / steps); await wait(pg, 40); }
}
const goto = (pg, path) => pg.goto(BASE + path, { waitUntil: "networkidle" });
const answer = (pg, text) => pg.waitForFunction((t) => document.body.innerText.includes(t), text, { timeout: 30000 });

const SHOTS = {
  "01-home": { what: "Home page, still, then a slow scroll past the stats", run: async (pg) => { await goto(pg, "/"); await pg.mouse.move(1500, 300); await wait(pg, 4000); await glide(pg, 500, 4000); await wait(pg, 3000); await glide(pg, -500, 2000); await wait(pg, 1500); } },
  "02-trap-card": { what: "The rotating trap card on home changes once", run: async (pg) => { await goto(pg, "/"); await glide(pg, 350, 1500); await wait(pg, 14000); } },
  "03-pick-usage": { what: "Average home → Read every plan", run: async (pg) => { await goto(pg, "/"); await wait(pg, 1500); await point(pg, pg.getByRole("button", { name: /Average home/ })); await wait(pg, 1200); await point(pg, pg.getByRole("button", { name: /Read every plan/ })); await pg.waitForURL(/wall/); await wait(pg, 2500); } },
  "04-05-wall-reveal": { what: "Tiles stamp as Kapi walks, then the $378 reveal and the year bars", run: async (pg) => { await goto(pg, "/wall?kwh=1100"); await answer(pg, "$378"); await wait(pg, 3000); await pg.mouse.move(900, 700, { steps: 30 }); await wait(pg, 5000); } },
  "06-locked-12": { what: "Toggle “Price locked 12+ months” and the number changes", run: async (pg) => { await goto(pg, "/wall?kwh=1100"); await answer(pg, "$378"); await wait(pg, 1500); await point(pg, pg.getByRole("switch", { name: /Price locked 12\+ months/ })); await wait(pg, 1500); await pg.evaluate(() => document.getElementById("answer")?.scrollIntoView({ behavior: "smooth" })); await wait(pg, 5000); } },
  "07-plan-page": { what: "Wattch's #1 plan page: label text, hover the bill lines", run: async (pg) => { await goto(pg, "/plan/37797?kwh=1100"); await wait(pg, 2500); const lines = pg.locator('li[title="Show this number in the label"]'); const n = Math.min(await lines.count(), 4); for (let i = 0; i < n; i++) { await point(pg, lines.nth(i), { click: false, pause: 1800 }); } await wait(pg, 1500); } },
  "07b-pick-plan-page": { what: "The state site's #1 (Simple Saver 3): hover its $125 credit line", run: async (pg) => { await goto(pg, "/plan/33633?kwh=1100"); await wait(pg, 2500); const lines = pg.locator('li[title="Show this number in the label"]'); const n = Math.min(await lines.count(), 5); for (let i = 0; i < n; i++) { await point(pg, lines.nth(i), { click: false, pause: 1600 }); } await wait(pg, 1500); } },
  "08-live-check": { what: "Check this label again now → the answer", run: async (pg) => { await goto(pg, "/plan/37797?kwh=1100"); await wait(pg, 1500); await point(pg, pg.getByRole("button", { name: /Check this label again now/ })); await pg.waitForFunction(() => /still prints|changed|isn.t there|Try again|same/i.test(document.querySelector('[aria-live]')?.textContent ?? ""), null, { timeout: 60000 }).catch(() => {}); await wait(pg, 4000); } },
  "09-current-plan": { what: "Already on a plan? → type simple saver → pick Simple Saver 3", run: async (pg) => { await goto(pg, "/wall?kwh=1100"); await answer(pg, "$378"); await wait(pg, 1000); await point(pg, pg.locator("#cur-q")); await pg.keyboard.type("simple saver", { delay: 120 }); await wait(pg, 1200); await point(pg, pg.locator("#cur-q ~ ul button").first()); await wait(pg, 1500); await glide(pg, 300, 1500); await wait(pg, 4000); } },
  "10-traps": { what: "Traps guide, slow scroll through 2–3 kinds", run: async (pg) => { await goto(pg, "/traps"); await wait(pg, 2500); await glide(pg, 700, 5000); await wait(pg, 2000); await glide(pg, 700, 5000); await wait(pg, 2000); } },
  "10b-dallas": { what: "Home → Dallas–Fort Worth → Read every plan → $530", run: async (pg) => { await goto(pg, "/"); await wait(pg, 1200); await point(pg, pg.getByRole("radio", { name: /Dallas/ })); await wait(pg, 2000); await point(pg, pg.getByRole("button", { name: /Read every plan/ })); await answer(pg, "$530"); await wait(pg, 5000); } },
  "10c-espanol": { what: "Results → Español in the header → the same answer in Spanish", run: async (pg) => { await goto(pg, "/wall?kwh=1100"); await answer(pg, "$378"); await pg.evaluate(() => scrollTo({ top: 0, behavior: "smooth" })); await wait(pg, 1500); await point(pg, pg.getByRole("link", { name: /^Español$/ }).first()); await pg.waitForURL(/lang=es/); await answer(pg, "$378"); await wait(pg, 5000); } },
  "11-share": { what: "Share card image for the result (opens in a new tab; the clip follows it)", run: async (pg) => { await goto(pg, "/wall?kwh=1100"); await answer(pg, "$378"); await wait(pg, 1000); const [card] = await Promise.all([pg.context().waitForEvent("page"), point(pg, pg.getByRole("button", { name: /^Share card$/ }))]); await card.waitForLoadState(); await pg.goto(card.url()); await card.close(); await wait(pg, 5000); } },
  "12-home-end": { what: "Home page, still (closing line)", run: async (pg) => { await goto(pg, "/"); await pg.mouse.move(1600, 200); await wait(pg, 9000); } },
  "demo-slow": { what: "/demo?speed=slow, all 7 scenes on their own (≈70 s)", run: async (pg) => { await goto(pg, "/demo?speed=slow"); await pg.mouse.move(1900, 1070); await wait(pg, 72000); } },
};

const pick = process.argv.slice(2);
const ids = pick.length ? pick : Object.keys(SHOTS);
mkdirSync(OUT, { recursive: true });
const hasFfmpeg = (() => { try { execFileSync("ffmpeg", ["-version"], { stdio: "ignore" }); return true; } catch { return false; } })();
const b = await chromium.launch({ executablePath: CHROME });
if (CHROME !== SHELL) console.log("(no Playwright headless shell found: clips may have a gray band at the bottom)");
let bad = 0;
for (const id of ids) {
  const shot = SHOTS[id];
  if (!shot) { console.log("unknown shot", id); bad++; continue; }
  const ctx = await b.newContext({ viewport: SIZE, deviceScaleFactor: 1, recordVideo: { dir: OUT + "/.tmp", size: SIZE } });
  await ctx.addInitScript(CURSOR);
  const pg = await ctx.newPage();
  const errs = [];
  pg.on("pageerror", (e) => errs.push(e.message));
  pg.on("response", (r) => r.status() >= 400 && errs.push(`HTTP ${r.status()} ${r.url()}`));
  const t0 = Date.now();
  try { await shot.run(pg); } catch (e) { errs.push(e instanceof Error ? e.message.split("\n")[0] : String(e)); }
  const video = pg.video();
  await ctx.close();
  const src = await video.path();
  const webm = `${OUT}/${id}.webm`;
  renameSync(src, webm);
  if (hasFfmpeg) execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", webm, "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", `${OUT}/${id}.mp4`]);
  console.log(errs.length ? "FAIL" : "ok  ", id, `${((Date.now() - t0) / 1000).toFixed(0)} s`, existsSync(`${OUT}/${id}.mp4`) ? "(+mp4)" : "", errs.slice(0, 2).join(" | "));
  bad += errs.length ? 1 : 0;
}
await b.close();
process.exit(bad ? 1 : 0);
