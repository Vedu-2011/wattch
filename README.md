# Wattch — the real price of every Houston and Dallas–Fort Worth power plan

**Live:** https://getwattch.vercel.app · English and Spanish (`/es`, or `?lang=es` on any page)

Texas lets you pick your electricity plan, then hides the real price in each plan's fine print (the
Electricity Facts Label, or EFL). Wattch reads the fine print of every Houston (CenterPoint) and Dallas–Fort Worth
(Oncor) plan on the state's Power to Choose site, checks every read against the label's own printed prices, and does
the honest math at **your** usage — with real local seasons, because a Houston August bill is about 2.6× a February one.

**AI reads. Code checks. Code decides.** The AI only copies numbers off each label. Plain, tested code rebuilds the
label's three printed prices (500 / 1,000 / 2,000 kWh) from what was read; a plan is "verified" only if all three
match within 0.1¢. Bills, yearly cost, ranking, cliffs and every "why" line are computed by code, never written by AI.

## What it shows
- **The reader wall** — one tile per plan flipping from "reading…" to ✓ (replays the real reads and their timing).
- **The reveal** — what the plan the state site lists first would cost you a year vs. your best plan, and why
  (e.g. "Its $125 credit only kicks in at 1,000 kWh. You'd miss it 6 months a year").
- **Houston seasons** — 12 real months shaped by ERCOT grid data for the Coast zone, not one flat month.
- **Plan pages** — the label check table, your bill line by line, your year, and a bill-vs-usage chart with price cliffs.
- **Fine-print highlighter** — on each plan page, hover a bill line and the exact number it came from lights up in the label text.
- **Your own 12 months** — type your usage from your bills instead of using an average.
- **Filters** — price locked 12+ months, no bill-credit cliffs, 50%+ renewable, 4+ stars; autopay discounts on/off. Every setting lives in the URL.
- **Already on a plan?** — switch-or-wait math with your plan's real early-exit fee.
- **/compare** — two plans month by month. **/traps** — every kind of catch, each with a real plan. **/demo** — a click-free walk-through for presenting.
- **Check this label again now** — re-downloads a label live and says whether the prices changed.
- **Share card + QR** for trying it on your own phone.
- **Every bill line explained** — one plain sentence per line, plus a warning when you just miss a credit; **questions
  to ask before you sign**, written from the plan's own label; plan pages **print** on one page.
- **Two areas** — Houston (CenterPoint) and Dallas–Fort Worth (Oncor), each with its own plans and seasons; the
  `/how` page shows both pipelines with live counts.
- **Spanish** — every page people use (home, wall, plan, compare, traps, reminder, share card).
- **/remind** — a calendar reminder (.ics) 30 days before your contract ends; nothing is stored.

## AI tools used
| Tool | What for |
|---|---|
| **Anthropic Claude API — `claude-haiku-5-5`** | Inside the app's data pipeline: reads each plan's EFL text into JSON (`src/lib/reader/parse.ts`). Its output is never trusted until code rebuilds the label's prices. |
| **Claude Code** (Anthropic) | Coding assistant: wrote and tested much of the code, the data fixes, and the UI. |
| **Codex** (OpenAI) | Coding assistant and code reviewer before each push. |
| **Claude** (claude.ai chat) | Planning, architecture, and writing prompts/docs. |
| *(not AI)* Playwright, axe-core, Lighthouse | Screenshots, accessibility and performance checks. |
| **Anakin.io** (sponsor) | Opens fine-print pages that need a real browser or block plain downloads (`src/lib/reader/fetchEfl.ts`). |

## Data sources
See [docs/SOURCES.md](docs/SOURCES.md) and the in-app `/sources` page: Power to Choose (PUCT) plan list, each
provider's EFL, 16 TAC § 25.475 (EFL rules), ERCOT load profiles for the Coast and North Central weather zones (seasons) and
EIA Form 861M (Texas monthly residential usage). Outside statistics are only used after their page was opened and quoted there.

## Run it
```bash
npm ci
npm run dev        # http://localhost:3000
npm test           # vitest — bill math, ranking, seasons, label checks, CSV parser, real label text, EN/ES parity
npm run lint
npm run build
```

Keeping the data fresh:
```bash
npm run refresh                          # free dry run: what changed on Power to Choose since the last read (writes nothing)
npm run refresh -- --area all            # Houston + Dallas–Fort Worth
npx tsx --env-file=.env.local scripts/refresh.ts --apply   # re-read; only new or changed labels go to the AI (~0.7¢ each)
```

Data pipeline (writes `data/plans.json` + `data/text/<id>.txt`; `--area dallas` writes `data/plans-dallas.json` + `data/text-dallas/`):
```bash
npx tsx --env-file=.env.local scripts/ingest.ts               # read every Houston plan (reuses unchanged reads)
npx tsx --env-file=.env.local scripts/ingest.ts --area dallas # same for Dallas–Fort Worth (Oncor)
python3 -I scripts/area_seasons.py NCENT ...   # an area's seasons from ERCOT profiles (arguments in the file header; docs/SOURCES.md)
npx tsx --env-file=.env.local scripts/ingest.ts --redo-failed --force
npx tsx scripts/recheck.ts [--area dallas]  # free: second chances for plans that didn't add up (no network, no AI)
npx tsx scripts/top.ts          # quick look at the top plans
npx tsx scripts/headline.ts     # the headline numbers (state site's #1 vs best, gap, rank) — use before any deck/video
python3 scripts/houston_seasons.py   # rebuild data/seasons-houston.json from ERCOT profiles (see docs/SOURCES.md)
python3 scripts/seasons.py data/sources/eia861m-texas.csv    # old statewide model (data/seasons.json)
node scripts/axe.mjs            # accessibility check of every page (needs the app running on :3000)
node scripts/meta-check.mjs     # Dallas URLs: no "Houston" in title/description/social card text (app on :3000)
node scripts/shots.mjs <folder> # screenshots at 375 / 1440 / 1920 (needs the dev server and Google Chrome)
node scripts/gallery.mjs        # the 6 Devpost gallery images, 1920×1080, into docs/gallery (app on :3000)
npx tsx scripts/rehash.ts       # free: re-download labels and fix stored hashes (no AI); lists labels that changed
python3 -I scripts/profile_counts.py <xlsx> "<TDSP>" <zone> <out.csv>   # one utility's home counts from ERCOT's workbook
```

Wattch shows the math. Always open the plan's fine print before you switch. Prices are before taxes.
