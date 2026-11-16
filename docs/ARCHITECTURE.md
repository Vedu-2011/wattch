# Wattch — ARCHITECTURE (planner, Nov 14, 2026)

## One line
Texas lets you pick your electricity plan, but the real price hides in each plan's fine print (the EFL,
"Electricity Facts Label"). Wattch sends a swarm of readers to read EVERY Houston plan's EFL, then plain code
does the honest math at YOUR usage — and proves every read is right.

## Why it wins (judging map)
- Functionality 30%: the core is a deterministic bill calculator with unit tests. AI only reads.
- Value & Impact 25%: real Texas money. Headline (cite as "one study estimates"): Laurel Peltier's June 2026
  study, reported by Dave Lieber (Dallas Morning News Watchdog): ~11M Texas families, ~$4B, ~$480/family/yr in
  overcharges vs. the old utilities. EnergyBot study: 98% of shoppers couldn't pick the cheapest plan.
  Every stat goes in docs/SOURCES.md with a working link BEFORE it appears in UI/deck. Builders: verify each link.
- UX 20%: judge scans a QR, picks usage, watches the reader wall, gets ONE clear answer + a slider.
- Creativity 15%: the "plan cliff" chart (bill-credit traps) and the self-check against the regulator's numbers.
- Presentation 10% + capybara bonus: original capybara mascot "Kapi" reads the fine print (our own drawing, SVG).

## The demo (what judges see, 60 seconds)
1. Scan QR → wattch.xyz. "How much power do you use?" → presets (Apartment / House / Big house) or type kWh,
   or (stretch) snap a photo of your bill.
2. THE READER WALL: a grid of plan tiles (one per plan, Kapi icon). Tiles flip from "reading…" to the real
   rate structure (base fee, ¢/kWh, credits, tiers) with a ✓ "matches the label" badge. Counter: "143 plans read".
3. THE REVEAL: "The plan Power to Choose ranks near the top at 1,000 kWh costs you $X more per year at YOUR
   1,180 kWh. Your best plan: ___. It stays cheapest until ___ kWh."
4. THE SLIDER: drag usage → rankings re-sort instantly. THE CLIFF CHART: bill vs. kWh for a bill-credit plan —
   the bill jumps when you use 1 kWh too few.
5. "Why?" button → plain-English explanation of each trap (Anakin AI QuickApp, or cheap Claude fallback).

## AI reads, code decides
- AI/scraper READS: each EFL (PDF or HTML viewer) → strict JSON `PlanPricing` (schema below).
- CODE DECIDES: bill math, ranking, cliff detection, annual cost, early-termination-fee math, and the VALIDATOR.
- VALIDATOR (the flex): every EFL must state the average price at 500, 1,000 and 2,000 kWh (Texas rule,
  16 TAC §25.475 — builders: confirm the citation text). Code recomputes those 3 numbers from the parsed JSON.
  If all 3 match the label (within rounding, ±0.1¢/kWh), the plan is ✓ VERIFIED. If not → re-read once with the
  mismatch as feedback → still wrong → "Couldn't verify — not ranked" (shown honestly, never hidden).

## Data
- Plan list: Power to Choose CSV export `http://www.powertochoose.org/en-us/Plan/ExportToCsv` (PUCT's official
  site). Has every plan + headline prices at 500/1000/2000 + the EFL link. Filter to CenterPoint (Houston) TDU.
  Also a JSON service exists (`/en-us/service/v1/`, POST method "plans") — use whichever is more reliable.
- EFLs: mostly PDFs, some HTML viewers (e.g. eflviewer.*.com). Fetch via Anakin.io (URL scraper, browser mode
  for JS pages, batch up to 10). Fallback: direct fetch for plain PDFs.
- Usage profile (12 months for Houston): must come from a REAL cited source (e.g. ERCOT residential load
  profiles for the Coast weather zone, or EIA Texas residential averages). No invented numbers. If not found
  quickly, ask the planner — don't guess.
- Delivery (TDU) charges: CenterPoint's charges are usually already inside the EFL price; parse what the EFL says.

## PlanPricing schema (Zod, src/lib/plans/schema.ts)
planId, provider, planName, tdu, termMonths, rateType (fixed|variable|indexed|tou), renewablePct,
baseChargePerMonth ($), energyCharges: [{fromKwh, toKwh|null, centsPerKwh}],
tduFixedPerMonth ($|null), tduCentsPerKwh (¢|null),
billCredits: [{minKwh, maxKwh|null, amount ($)}], minUsageFee: {belowKwh, amount}|null,
touNotes (string|null — time-of-use plans are listed but NOT ranked in v1),
etf: {amount, perMonthRemaining?}, labelAvg: {at500, at1000, at2000} (¢/kWh as printed), eflUrl, fetchedAt,
eflSha256, parseSource ("anakin-json"|"claude"|"manual"), verified (bool), verifyDiff.

## Architecture
- Next.js (App Router, TS) + Tailwind + shadcn/ui on Vercel. Upstash Redis (prefix `wattch:`) for cache.
- `scripts/ingest.ts` (also an API route behind a secret): CSV → filter → for each plan: fetch EFL (hash) →
  if hash unchanged, reuse cached parse → else parse → validate → store. Parse each EFL ONCE; cache forever by hash.
- Parsing order (cheapest first): (1) PDF text extract locally (pdf-parse/unpdf) → regex fast-path for common
  layouts; (2) Anakin.io JSON extraction; (3) Claude Haiku JSON (small, cached). Track $ spent per run.
- `/api/wall` streams (SSE) tile events for the reader wall. LIVE mode: re-fetch a handful of EFLs right now via
  Anakin and show "fetched just now"; the rest replay from cache with their real "read at" time. Never fake.
- `src/lib/bill/` pure functions: monthlyBill(plan, kWh), annualCost(plan, profile12), labelCheck(plan),
  findCliffs(plan, range), rank(plans, usage). 100% unit-tested with hand-checked test-data/ EFLs.
- Explainer: Anakin AI QuickApp via API if credits allow; fallback Claude Haiku; responses cached per plan.

## Pages
/ (home + usage picker) · /wall (reader wall + reveal) · /plan/[id] (one plan: parsed vs. label, cliff chart,
"open the original EFL") · /how (how it works + validator explained) · /sources · /style (component gallery).

## Business track (deck ≤15 pages, Vedhanth as CEO)
Free for consumers. Revenue: referral fee when a user switches (verify typical fees before quoting), $3/mo
"renewal guard" (watches your contract end + rate changes), B2B white-label for apartment complexes/movers.
Market: ERCOT "retail switching for more than 8 million premises" (ercot.com/about — verify). Competitors:
Power to Choose (free, 3 usage snapshots only), EnergyBot, ComparePower, ElectricityPlans (free, referral-paid),
Rocket Money ($7–14/mo, doesn't do Texas power plans). Ask: $25k pre-seed or a pilot with one apartment company.

## Risks → fallbacks
- EFL layouts vary → validator auto-excludes bad reads; hand-check the 20 most common plans in test-data/.
- Blocked/slow fetches → Anakin browser mode + cache; demo replays real cached reads with timestamps.
- Claude credit (~$8) → parse once, cache by hash, Haiku only, log $; Anakin does fetch/extract.
- "Isn't this a comparison site?" → lead with the self-check + cliff chart + YOUR usage, which nobody shows.
- Not financial advice: footer "Wattch shows the math. Always read the EFL before you switch."

## Builders split (both every day, never the same files)
- Codex: data + engine — src/lib/plans/**, src/lib/bill/**, scripts/**, src/app/api/**, tests, test-data/.
- Claude Code: UI/design — src/app/(pages)/**, src/components/**, docs/DESIGN.md, mascot, charts, animations.
- Shared contract: src/lib/plans/schema.ts (Codex owns; Claude Code reads only).

## Schedule
Sat 11/14 night: phase-0 setup. Sun–Fri: build (Wed 10 PM reset). Fri 11/20 night: FEATURE FREEZE.
Sat 11/21 AM: ~5-min video (his voice, captions), deck, Devpost both tracks; submit by noon PT.
