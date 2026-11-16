# Wattch — STATUS (Claude Code, overnight-1, Nov 15–16 2026)

Live: https://getwattch.vercel.app · Repo: github.com/Vedu-2011/wattch (main)

## Numbers (all from code / data in the repo)
- **172** Houston (CenterPoint, English) plans on Power to Choose at the last read.
- **161 verified** (all 3 label prices rebuilt within 0.1¢) · **3 mismatch** (Pronto Power, prepaid — not ranked anyway) ·
  **8 unread** (Express Energy ×4, Veteran Energy ×2, TriEagle, Octopus Octo Simple 14 — their label opens in a blob iframe).
  - How the 161 were verified: 143 by the AI reader (the planner's run), 1 with Power to Choose's averages (reader copied one wrong),
    11 by the code form-field reader (Ranchero / Southern Federal), 6 hand-read (TXU Free Nights & Cool Summer, Tara and
    Amigo Day Hours, SmartEnergy ×2, Texans Choice) — every one passes the same code check. 24 needed CenterPoint
    delivery charges filled in from other labels because their label doesn't print them (shown on the plan page).
- Ranked = verified, not prepaid, not variable-rate. 13 variable-rate plans are verified but not ranked.
- **Typical home, 1,100 kWh/month, Texas seasons on:** the plan Power to Choose lists first (AP Gas Simple Saver 3,
  "6.2¢" at 1,000 kWh) ranks **#69** and costs **$378/yr more** than the best plan (SmartGreen 3, $1,334/yr).
  Why: its $125 credit needs 1,000 kWh; a 1,100 kWh-average home is under that **6 months a year**.
  With "Price locked 12+ months" on: state site's #1 among those (AP Gas SimpleSaver 12) ranks **#38**, **$208/yr** more.
- Texas seasons (EIA-861M, 2023–2025): average Texas home **1,117 kWh/month**; August **1.46×**, April **0.71×** the average.
- **62 tests** (vitest) — bill math, label check, cliffs, grounded(), fillTdu(), form-field reader, averages cross-check,
  hand-reads, tduCandidates, CSV parser, seasons, ranking, reveal, whyLine, traps, and a guard that every verified plan
  in data/plans.json still rebuilds its label.

## What works
- Home: usage picker (presets + typed kWh, average-Texas-home hint).
- /wall: reader wall replay (compact on phones), scrolls to the answer, the reveal (big $ gap, side-by-side cards,
  "why" line from code, month bars with the credit line), biggest sticker-vs-real gap, slider, toggles
  (Texas seasons / price locked 12+ months / autopay discounts), top 8, judge QR, Share + share card.
- /plan/[id]: label check table, how it was checked, bill lines, your year + why + month bars, cliff chart, AI notes (labelled).
- /api/card: 1200×630 share image (also the og:image for /wall links).
- /how, /sources (EIA added), /api/live (re-fetch one label; hash bug fixed tonight).
- Pipeline: ingest.ts (AI read → code check → rescue step), recheck.ts (free, offline), rehash.ts, seasons.py, top.ts, shots.mjs.

## What's left / known limits
- **No paid re-read tonight**: copying the API key from DSH was blocked by a permission rule (see _coord/NEEDS-VEDHANTH.md).
  The improved reader prompt has NOT been run yet. When the key is in .env.local:
  `npx tsx scripts/ingest.ts --redo-failed --force` (≈ $0.05–0.20 at Haiku prices for ~11 plans; not measured).
- 31 labels changed since they were read (many print today's date, so the text differs daily). Their records keep the
  old (empty) hash, so the next ingest re-reads them (costs a little API). Hand-reads are pinned to the old text and will
  stop applying if that label's text changes — then the plan honestly falls back to "not verified".
- Seasons are statewide Texas, not Houston-only, and by billing month.
- One-time rebates (e.g. SmartEnergy $200) are not in yearly cost — shown in notes only.
- Yearly cost uses today's price for 12 months; 3-month plans are tagged "3-month price" and the 12+ month toggle exists.
- Not done: Anakin AI QuickApp explainer, live mode on the wall, wattch.xyz domain, deck/Devpost/video.
- Stats in ARCHITECTURE.md (Peltier/Lieber $480, EnergyBot 98%, ERCOT 8M) are still unverified — not used in the UI.
