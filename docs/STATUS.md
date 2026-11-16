# Wattch — STATUS (Claude Code, overnight-2, updated Nov 15 2026 ~23:30 PT)

Live: https://getwattch.vercel.app (main) · Overnight work: branch `overnight` (Vercel preview) · Repo: github.com/Vedu-2011/wattch

## Numbers (all from code / data in the repo — `npx tsx scripts/headline.ts`)
- **172** Houston (CenterPoint, English) plans on Power to Choose at the last read (data built Nov 16, 07:03 UTC).
- **171 verified** (all 3 label prices rebuilt within 0.1¢) · **1 mismatch** — Pronto Power "Power To Choose" (prepaid):
  its printed charges give 18.2/17.1/16.5¢ but the label prints 17.6/15.9/15.1¢; the plan page explains this.
  The 8 that couldn't be opened last night (Express ×4, Veteran ×2, TriEagle, Octopus 14) are now read and verified.
- Ranked = verified, not prepaid, not variable-rate → **154 ranked**.
- **Typical home, 1,100 kWh/month, Houston seasons on:** the plan Power to Choose lists first (AP Gas Simple Saver 3)
  ranks **#74 of 154** and costs **$378/yr more** than the best plan (SmartGreen 3, $1,334/yr vs $1,712/yr).
  Why: its $125 credit needs 1,000 kWh; that home is under 1,000 kWh **6 months a year** ($750 of credits missed).
  With the same usage every month (seasons off) it really is #1 — the trap is the seasons.
- Houston seasons: ERCOT backcasted residential load profiles 2023–25 for the Coast zone, mixed by CenterPoint's real
  home counts (ERCOT Profile Type Counts, Nov 2 2026). August ≈ 1.63× the average, February ≈ 0.63× (Aug ≈ 2.6× Feb).
  EIA's Texas average home (1,117 kWh/month) is still used for the "average home" hint.
- **18** rankable plans have a usage trap (bill-credit cliff, minimum-use fee, or price cliff).
- **98 tests** (vitest), lint + build clean.
- Paid API tonight: ≈ $0.87 (Haiku re-reads), well under the $3 cap.

## What works (new tonight marked ★)
- Home: usage picker; ★ live counts (read / checked / with a trap) + ★ rotating real trap card.
- Header on every page: ★ "171 of 172 labels check out · read N ago".
- /wall: reader replay, reveal (big $ gap, cards, "why", month bars), biggest sticker-vs-real gap, slider, toggles,
  ★ filters (12+ month lock, no bill-credit traps, 50%+ renewable, 4+ stars — all shareable in the URL),
  ★ "Use my real 12 months" (type or paste a bill's usage history; ?m= in the URL), top 8 with ★ "Compare with #1",
  ★ "Already on a plan?" (yearly extra, exit fee, payback months, plain switch/wait answer), judge QR, share card.
- ★ /compare?a=&b=: two plans over your year — saving, months each wins, paired bars + table, cliffs, exit fees.
- /plan/[id]: label check, bill lines, your year + bars, cliff chart, ★ fine-print highlighter (the label text the AI
  read with every number the math used marked; hover a bill line and its number glows), ★ "Check this label again now".
- /api/card, /how, /sources, /api/live.
- Pipeline: ingest.ts (AI read → code check → rescue; ★ Anakin retry, ★ --workers, ★ code slip-fixes,
  ★ Vistra/Octopus label URL fixes, ★ Pronto template), recheck.ts (free), houston_seasons.py, headline.ts.

## Known limits
- Yearly cost uses today's price for 12 months; 3-month plans are tagged "3-month price".
- One-time rebates aren't in yearly cost (notes only). Taxes not included.
- Hand-reads are pinned to the label text they were made from; if a label changes, that plan falls back to "not verified".
- Stats in ARCHITECTURE.md (Peltier/Lieber $480, EnergyBot 98%, ERCOT 8M) are still unverified — not used in the UI.
- Not done yet: wall animation polish, reveal count-up, /traps, /demo, a11y/Lighthouse pass, Devpost/script/deck.
