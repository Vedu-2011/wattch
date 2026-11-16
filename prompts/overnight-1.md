# Overnight 1 — take over Wattch and push it toward "insane" (Claude Code, autonomous)

Vedhanth is ASLEEP. Work alone all night. Never stop to ask him anything. If something truly needs him
(CAPTCHA, account, payment), skip it, note it in the handoff, keep going on the rest.

## NEVER STOP FOR PERMISSION (most important rule tonight)
Deleting files always triggers a permission prompt, even in bypass mode, and a prompt would freeze you until morning.
- NEVER delete anything: no rm, rmdir, unlink, `git clean`, `git rm`, `git reset --hard`, `git checkout -- <file>`,
  `git stash drop`, or tools that delete/overwrite by deleting.
- Instead of deleting, MOVE the thing to ~/Hackathons/_coord/_to_delete/2026-11-16/<same path> (mkdir -p first),
  and add one line to ~/Hackathons/_coord/TO-DELETE.md: path · why · moved where.
- To stop tracking a file in git, edit .gitignore and use `git rm --cached` ONLY if it doesn't prompt; otherwise log it.
- If ANY command or tool asks for approval: cancel it, write it in ~/Hackathons/_coord/NEEDS-VEDHANTH.md
  (what, why, exact command), and move on to the next task. Never wait.
- Temp folders (like the clone in Setup) go under ~/Hackathons/_coord/_tmp/ and get logged in TO-DELETE.md.

Read first: ~/Hackathons/CLAUDE.md, ./CLAUDE.md, docs/ARCHITECTURE.md, _coord/BOARD.md. Add your BOARD row.

## Where things stand (built tonight by the planner chat in its cloud workspace)
- Repo: github.com/Vedu-2011/wattch (main = d37d9ad). Live: https://getwattch.vercel.app (Vercel project "wattch",
  auto-deploys from main; also wattch-black.vercel.app).
- Stack: Next.js 16.4 (App Router; pages that read searchParams use `export const instant = false`), Tailwind v4,
  zod 4, vitest, unpdf. No shadcn yet. Read node_modules/next/dist/docs before using new Next APIs.
- Data: scripts/ingest.ts reads every Houston (CenterPoint, English) plan from the Power to Choose CSV, fetches each
  EFL (direct PDF, else Anakin.io keyless scraper), AI-reads it with claude-haiku-5-5 (src/lib/reader/parse.ts),
  then CODE checks: the 3 printed averages (500/1000/2000 kWh) must be literally in the text (grounded()) and must be
  rebuilt to ±0.1¢ by src/lib/bill (labelCheck). Snapshot committed at data/plans.json + data/text/<id>.txt.
  Now: 172 plans → 143 verified, 21 mismatch, 8 unread (Express/Veteran/TriEagle render their EFL in a blob iframe).
- Pages: / (usage picker), /wall (reader wall replay + reveal vs Power to Choose's #1 + "biggest surprise" + slider
  + top 8), /plan/[id] (label check table, bill lines, CliffChart), /how, /sources, /api/live (re-fetch one EFL, compare sha).

## Setup (first 10 min)
1. This folder already has CLAUDE.md, AGENTS.md, docs/, prompts/, test-data/, HANDOFF.md. Bring the repo in WITHOUT
   losing them: clone to ~/Hackathons/_coord/_tmp/wattch, then COPY (cp -R, never move-with-replace) its contents + .git in here. The repo's AGENTS.md has a Next.js block —
   merge it into ours (keep both). Commit our docs/prompts into the repo too.
2. .env.local: ANTHROPIC_API_KEY copied from ../DSH Hacks/.env.local. Never print or commit it.
3. npm ci, npm test, npm run build, npm run lint — all must pass before you change anything.

## Tasks (in order; commit + push to main after each one that passes tests/build/lint — Vedhanth said the
## planner may push to main for Wattch tonight; nothing is "demo-locked" yet)
1. MISMATCHES: `npx tsx scripts/ingest.ts --redo-failed --force` re-reads the 21 with the improved prompt
   (--force is needed: same-sha plans are otherwise skipped). Then look at each still-failing plan's
   data/text/<id>.txt vs its pricing and fix the cause in the schema/prompt/bill math (examples seen: SmartEnergy
   one-time $200 rebates, TXU "Free Nights & Cool Summer" seasonal TOU, Pronto odd tiers, Ranchero PDF form fields
   that need Anakin, Tara setup fee). Add a vitest for every fix using the real numbers. Target ≥155 verified.
   Spend ≤ $1 of API. Log tokens.
2. SEASONS (big value): Houston usage is not flat — summer AC bills are ~2× winter. Find a REAL cited monthly
   shape (ERCOT residential load profile for the Coast weather zone, or EIA Texas residential monthly sales ÷
   customers). Add "Use Houston seasons" (default ON) so annual cost = 12 real months scaled to the user's average.
   Put the source in /sources and docs/SOURCES.md. This is where bill-credit plans really hurt — show it.
3. REVEAL polish: the reveal must be jaw-drop on a phone. Big dollar number, the state site's #1 vs your #1,
   "why" in one line (e.g. "its $125 credit only kicks in above 1,000 kWh — you dip below that 5 months a year").
   Make every number come from code, never the AI notes.
4. DESIGN pass (375px + 1440px + 1920 projector): screenshot every page with Playwright, fix anything ugly.
   No gray hairline borders. Kapi the capybara (src/components/Kapi.tsx) should appear more (empty states,
   loading, the wall). Keep the warm "paper + volt yellow" look already there.
5. QR + share: /wall shows a QR (qrcode.react) to getwattch.vercel.app for judges; a share card per result.
6. Tests: bill math, ranking, cliffs, grounded(), fillTdu(), CSV parser. Target ≥40 tests.
7. Docs: docs/STATUS.md (what works, numbers, what's left), README "AI tools used" list
   (Claude Code, Codex, Anthropic Claude API (claude-haiku-5-5), Anakin.io) — STEM2Connect requires it.

## Rules
- AI reads, code decides. Never show a number the code didn't compute or the label didn't print.
- No invented stats or sources. If unsure, leave it out and note it in the handoff.
- Plain human wording. Friendly errors. Mobile-first.
- Codex review before each push if Codex is available; otherwise do a careful self-review pass.

## When done (or out of usage): handoff file in ~/Hackathons/_coord/handoffs/ (format in root CLAUDE.md),
BOARD row → Done, run _coord/tidy.sh. Say: "Handoff saved — tell the planner: handoffs".
