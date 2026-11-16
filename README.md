# Wattch — the real price of every Houston power plan

**Live:** https://getwattch.vercel.app

Texas lets you pick your electricity plan, then hides the real price in each plan's fine print (the
Electricity Facts Label, or EFL). Wattch reads the fine print of every Houston (CenterPoint) plan on the state's
Power to Choose site, checks every read against the label's own printed prices, and does the honest math at
**your** usage — with real Texas seasons, because summer AC bills are about twice spring's.

**AI reads. Code checks. Code decides.** The AI only copies numbers off each label. Plain, tested code rebuilds the
label's three printed prices (500 / 1,000 / 2,000 kWh) from what was read; a plan is "verified" only if all three
match within 0.1¢. Bills, yearly cost, ranking, cliffs and every "why" line are computed by code, never written by AI.

## What it shows
- **The reader wall** — one tile per plan flipping from "reading…" to ✓ (replays the real reads and their timing).
- **The reveal** — what the plan the state site lists first would cost you a year vs. your best plan, and why
  (e.g. "Its $125 credit only kicks in at 1,000 kWh. You'd miss it 6 months a year").
- **Texas seasons** — 12 real months shaped by EIA data, not one flat month.
- **Plan pages** — the label check table, your bill line by line, your year, and a bill-vs-usage chart with price cliffs.
- **Share card + QR** for trying it on your own phone.

## AI tools used
| Tool | What for |
|---|---|
| **Anthropic Claude API — `claude-haiku-5-5`** | Inside the app's data pipeline: reads each plan's EFL text into JSON (`src/lib/reader/parse.ts`). Its output is never trusted until code rebuilds the label's prices. |
| **Claude Code** (Anthropic) | Coding assistant: wrote and tested much of the code, the data fixes, and the UI. |
| **Codex** (OpenAI) | Coding assistant and code reviewer before each push. |
| **Claude** (claude.ai chat) | Planning, architecture, and writing prompts/docs. |
| **Anakin.io** (sponsor) | Opens fine-print pages that need a real browser or block plain downloads (`src/lib/reader/fetchEfl.ts`). |

## Data sources
See [docs/SOURCES.md](docs/SOURCES.md) and the in-app `/sources` page: Power to Choose (PUCT) plan list, each
provider's EFL, 16 TAC § 25.475 (EFL rules), and EIA Form 861M (Texas monthly residential usage).

## Run it
```bash
npm ci
npm run dev        # http://localhost:3000
npm test           # vitest — bill math, ranking, seasons, label checks, CSV parser, real label text
npm run build
```

Data pipeline (writes `data/plans.json` + `data/text/<id>.txt`):
```bash
ANTHROPIC_API_KEY=... npx tsx scripts/ingest.ts              # read every Houston plan (reuses unchanged reads)
ANTHROPIC_API_KEY=... npx tsx scripts/ingest.ts --redo-failed --force
npx tsx scripts/recheck.ts      # free: second chances for plans that didn't add up (no network, no AI)
npx tsx scripts/top.ts          # quick look at the top plans
python3 scripts/seasons.py data/sources/eia861m-texas.csv    # rebuild data/seasons.json
node scripts/shots.mjs <folder> # screenshots at 375 / 1440 / 1920 (needs the dev server and Google Chrome)
```

Wattch shows the math. Always open the plan's fine print before you switch. Prices are before taxes.
