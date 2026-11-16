# BACKLOG — top = highest priority. Format: - [ ] task — done when…
## A. Data + engine (the core must be bulletproof)
- [x] Paid re-read with the new prompt: `npx tsx scripts/ingest.ts --redo-failed --force` then re-read the 31 labels whose text changed; keep hand-reads that still verify; log $ — verified count ≥ 161, every verified plan still passes the snapshot test
- [x] The 8 unread (Express/Veteran/TriEagle blob-iframe EFLs): try Anakin.io browser options from its docs (anakin.io/docs/api-reference/url-scraper — wait/render/PDF options) or the provider's direct PDF endpoint; if truly impossible, show them honestly as "couldn't open" with the reason — each of the 8 either verified or has a clear reason in the UI
- [x] The 3 remaining mismatches: read each label by hand, find the exact cause, fix code (not data) if it's a pattern — each one verified or explained on its plan page
- [x] Freshness: a "prices checked <time ago>" badge on every page + /api/live used on the plan page ("Check this label again now" button shows same/changed in plain words) — button works on a real plan
- [x] Houston-only seasons if a real source exists (ERCOT residential load profile for the COAST weather zone); otherwise keep Texas seasons and say why in /sources — source quoted in docs/SOURCES.md or decision logged
## B. The "insane" demo features (judges must SEE these)
- [x] FINE-PRINT HIGHLIGHTER on /plan/[id]: show the label text the AI read, with every number it used highlighted and linked to the bill line that uses it (hover a bill line → its number glows in the label). This proves "AI reads, code decides" visually — works on 3 different plans incl. a TOU plan
- [x] "Your current plan" picker: search your current plan → "You're paying $X/yr more than your best plan" + early-termination-fee math ("switching costs $150, pays back in N months") — correct numbers on 3 test cases with tests
- [x] Enter your real 12 months (12 small inputs, or paste from bill) → personal year instead of Texas seasons; bars + ranking use it — tests for the math
- [x] /compare?a=&b= — two plans side by side: bill at your usage, 12-month bars, cliffs, check rows; "Compare" button from ranking rows
- [x] Filters on the ranking: price locked ≥12 mo (exists), no bill-credit cliffs, renewable ≥50%, provider rating ≥4 — each filter changes the list and is shareable in the URL
- [x] Landing hero: live counter "Houston plans read: N · traps found: M" from real data + one example trap card that rotates every few seconds — numbers come from data/plans.json
- [x] Wall: make the reading animation feel alive (Kapi walks across, tiles stamp ✓) but finish ≤10s; reduced-motion respected — looks great at 375 and 1920
- [x] Reveal: count-up animation on the $ number, confetti-free; "Share my result" image via /api/card with the user's numbers — card renders with real numbers
- [x] "Trap encyclopedia" /traps: every trap type found in the data (bill-credit cliff, minimum-use fee, tiered, TOU, autopay credit, setup fee, 3-month teaser) with a real example plan + how much it costs at 3 usages — every example links to a real plan page
- [x] Demo mode /demo: a scripted, click-through flow for the video (fixed usage 1,100, auto-advances), with a "judge mode" QR — runs start to finish without input
## C. UX + design polish
- [x] Full screenshot pass of every page at 375/768/1440/1920; fix every ugly thing; save to docs/screenshots/overnight-2 — no sideways scroll, nothing clipped
- [x] 404 + error pages with Kapi; loading.tsx skeletons for /wall and /plan — each renders
- [x] Accessibility: labels, focus rings, contrast ≥ AA, keyboard through the whole flow, chart has text alternative — axe (via Playwright) shows 0 serious issues
- [x] Mobile nav (menu) + sticky "Read every plan" button on home for phones
- [x] Kapi: 3 more poses (thinking, surprised, celebrating) as original SVG; use them in reveal/empty/error states
- [x] Typography + spacing consistency pass; projector check at 1920 (text readable from the back of a room)
- [x] Favicon + app icon from Kapi; proper <title>/description per page; Open Graph images
## D. Quality
- [x] Tests to 100+: rescue/templates edge cases, compare math, current-plan/ETF math, 12-month input parsing, filters, API routes (mocked) — `npm test` ≥100 passing
- [x] Lighthouse (Playwright + lighthouse npm) on /, /wall, /plan: performance ≥90 mobile, accessibility ≥95 — scores logged in PROGRESS.md
- [x] Shrink what the browser downloads: don't ship full label text to /wall; per-plan data only on /plan — /wall JS+data < 300 KB
- [x] Type-safety pass: no `any`, zod-parse data/plans.json at load with a friendly error page if broken
## E. Submission readiness (Triple H + STEM2Connect + GenHacks)
- [x] docs/DEVPOST.md draft: inspiration, what it does, how I built it (AI reads, code decides, the check), challenges, accomplishments, what's next, built with — every claim checked against code/data; solo "I" voice
- [x] docs/SCRIPT.md: ~5 min demo video script (fits STEM2Connect ≤6 min), scenes + exact clicks + narration in "I" voice — timed to ≤5:30
- [x] docs/DECK.md: business-track deck ≤15 slides (exec summary, problem, market w/ cited numbers, product, business model, competitors table with real prices, traction/proof = our data, team, the ask) — every number has a source link in docs/SOURCES.md
- [x] README: STEM2Connect needs every AI tool listed (Claude Code, Codex, Claude chat, Anthropic Claude API haiku-5-5, Anakin.io) + how to run + data refresh — complete
- [x] Gallery images: 6 clean 1920×1080 screenshots for Devpost in docs/gallery/ — 6 files
- [x] Verify the planner's candidate headline stats (Dallas Morning News Watchdog on a June 2026 Peltier study: ~$480/family/yr; EnergyBot "98% couldn't pick the cheapest plan"); open the real pages; only use quotes you can link — SOURCES.md updated or "not verified" logged
## F. Stretch
- [x] Spanish version of the core flow (Houston is ~45% Hispanic — only state that number with a source) — toggle works
- [x] Oncor/Dallas, AEP, TNMP support (same pipeline, TDU filter) behind a city picker — at least one more area verified
- [x] "Renewal alarm" page: enter your contract end date → reminder .ics download 30 days before — .ics opens in Calendar
## G. Added overnight-2 (Nov 16, 00:10) — judges + submission strength
- [x] /how page: one clear diagram of the pipeline (Power to Choose CSV → label → AI reads → code rebuilds 3 prices → verified/ranked) built in plain HTML/SVG, not an image — renders at 375 + 1920, numbers from data
- [x] "Why is my bill different?" explainer on every plan page: one sentence per bill line (energy, delivery, base, credit) in plain words, generated by code from the plan's pricing — 3 plans checked by hand
- [x] Data refresh script `npm run refresh` (ingest → check → write plans.json + a short diff report of what changed) documented in README; dry-run mode costs $0 — dry run works
- [x] Headline numbers in one place: src/lib/headline.ts used by home, /wall, card, demo and scripts/headline.ts (no copies) — test that they all agree
- [x] Usage hint: "Not sure? Most Houston homes use about N kWh" from EIA number in SOURCES, shown in the picker — sourced
- [x] Print-friendly plan page (@media print): label proof + bill table on one page — prints on Letter in Chrome's print preview screenshot
- [x] 1920 projector pass of /demo + /wall reveal: biggest numbers readable at 1920 from "the back of the room" (≥64px for the $ number) — screenshots
- [x] Empty/edge states: usage 0, 50, 5000 kWh; 12 months all zero; every filter on at once — friendly text, no NaN/Infinity anywhere — tests + screenshots
- [x] Plan page "Questions to ask before you sign" (from the plan's own traps: credit cliff → "Will I use 1,000 kWh every month?") — code-generated, 3 plans checked
- [x] docs/JUDGE-QA.md: 15 likely judge questions with honest short answers (accuracy, why Haiku, cost per read, what if a label changes, business model, competitors) — every number sourced

## H. Added overnight-2 (Nov 16, 00:55) — second area polish + submission truth
- [x] Compare guard: /compare with one Houston and one Dallas plan id → friendly "these plans are in different areas" message, not a mixed bill — test
- [x] Free second chances for Dallas: make scripts/recheck.ts take --area and run it on the 2 Dallas mismatches + 26 unread ($0, no network) — counts before/after in PROGRESS
- [x] /traps trap guide per area (?area=dallas): counts and examples from Oncor plans, Houston unchanged — screenshots
- [x] Home: after picking Dallas–Fort Worth, the hero stats + trap carousel switch to Dallas numbers (no reload) — test that Houston home is unchanged
- [x] Metadata check: every page with ?area=dallas has no "Houston" in title/description/og text — test over all routes
- [x] Spanish for /remind and the bill-line sentences (es) — same code, axe 0 on the new Spanish pages
- [x] Lighthouse (mobile) on /remind, /how, /wall?area=dallas: a11y 100, perf ≥ 90 — fix anything under
- [x] Submission docs truth pass: DEVPOST/DECK/SCRIPT mention Dallas ($530, #84), reminder, bill explainer, refresh — every new number checked against scripts/headline.ts, [CHECK] marks kept
- [x] docs/STATUS.md refresh for the planner (tests, pages, Dallas, spend, Anakin quota, what is next)
- [ ] When Anakin quota is back (check first, $0 if not): re-read the 26 Dallas unread with --redo-failed (paid ≤ $0.30, PAID-API LOCK) — stay under the $3 night cap
- [x] Spanish plan page (?lang=es): headings, label check, bill lines + explainBill sentences in Spanish, questions, year card; links from the Spanish wall carry lang — axe 0, no mixed-language section
- [x] Header freshness badge per area: on ?area=dallas pages show Dallas counts (154 of 172) — test + screenshot
- [x] Codex review 7 (codex review --base main) — fix real findings
- [x] Header + freshness badge in Spanish on ?lang=es pages (nav: Trampas/Cómo funciona/Fuentes; "171 de 172 etiquetas cuadran · leídas hace 2 horas") — client reads ?lang like the area badge; axe 0

## I. Added overnight-2 (Nov 16, 01:30) — Spanish everywhere + submission polish
- [x] i18n parity test: words("es") has every key words("en") has (and PLAN_WORDS, ICS, remind T) — test fails if a key is missing
- [x] Spanish /compare (?lang=es): headings, table, verdict, area guard text — axe 0, no English outside lang=en
- [x] Spanish /traps (?lang=es): kind names, explanations, examples — axe 0
- [x] Share card in Spanish: /api/card?lang=es draws Spanish text; the Spanish wall share button uses it — screenshot of both cards
- [x] /how per area (?area=dallas): pipeline counts from the Oncor file; area switch on the page — Houston unchanged (test)
- [x] Plan links always carry ?area=dallas for Oncor plans (compare, current-plan, traps, carousel) so the header badge is right — grep + live check
- [x] README refresh: Dallas, Spanish, /remind, refresh script, meta-check, all scripts listed and run once — every command in it works
- [x] docs/JUDGE-QA.md update: Dallas, Spanish, reminder, explainer, codex findings — every number re-checked
- [x] Gallery: 2 more 1920×1080 shots (Dallas reveal, Spanish plan page) + captions in DEVPOST.md — files exist
- [x] Lighthouse mobile on /plan/33633?lang=es and /compare: a11y 100, perf ≥ 90 — logged

## J. Added overnight-2 (Nov 16, 01:47) — finish Spanish + review
- [x] Spanish "Already on a plan?" (CurrentPlan) on the Spanish wall: search, verdict, exit-fee math, reminder link — no English on /wall?lang=es (live check), parity test
- [x] Spanish "Use my real 12 months" (MyMonths) on the Spanish wall: labels, paste help, errors — parity test
- [x] Codex review 8 (running) — fix real findings
- [x] Spanish /how (?lang=es): steps, pipeline diagram labels; header "Cómo funciona" links to it — axe 0
- [x] 404 + error pages in Spanish when the URL has lang=es or starts with /es — screenshot
- [x] /api/live error messages in Spanish (?lang=es from LiveCheck) instead of the generic sentence — test
- [x] scripts/meta-check.mjs: also sweep Spanish URLs for English titles/descriptions — all clean
- [x] Full-flow Spanish walk-through in Chrome: /es → wall → plan → compare → traps → remind, no English outside lang=en — script + screenshots
- [x] docs/STATUS.md refresh (Spanish everywhere, Dallas fixes, scores, spend) for the planner
- [x] SCRIPT.md: optional 10-second Spanish beat (tap Español on the results, one line) — timed, total ≤ 5:30
- [x] K1 Spanish share card check: /api/card?lang=es&area=dallas renders, no English, no Houston (screenshot the PNG)
- [x] K2 Spanish print view of a plan page (PrintButton → print CSS): emulate print media, no English chrome, fits 1 page
- [x] K3 Keyboard-only pass on Spanish wall: Tab through LangSwitch, area switch, CurrentPlan search, MyMonths — focus visible everywhere
- [x] K4 Spanish /es home: hero numbers match the English home for both areas (same math, test)
- [x] K5 i18n: number/date formats on Spanish pages consistent (es-US dates, $ amounts unchanged) — grep + fix strays
- [x] K6 README: list Spanish + Dallas coverage and every AI tool used (STEM2Connect rule) — verify against code
- [x] K7 Codex review 9 (J1–J7 diff)
- [x] K8 Lighthouse on /how?lang=es and /es (now dynamic) — perf ≥ 90, CLS < 0.1
- [x] K9 JUDGE-QA: add Q on Spanish (why, how checked, what stays English and why: label text + AI notes)
- [x] K10 docs/DEVPOST.md: one Spanish line in "what it does", verified against the live pages
- [x] L1 Spanish /sources (?lang=es): headings + explanations translated, source titles/quotes stay as published (lang=en); nav "Fuentes" links with lang; add to es-walk + axe + meta-check
- [ ] L2 LangSwitch keeps every result param (kwh, area, m, filters, a/b, autopay) when switching — test + live check
- [ ] L3 hreflang: each page declares its other-language twin (alternates.languages) so search engines pair them
- [ ] L4 global-error.tsx (data file broken) in Spanish when the URL is Spanish — or document why it cannot (no hooks there)
- [ ] L5 docs/DECK.md truth pass: Spanish + test counts + Lighthouse numbers vs. the code
- [ ] L6 /demo: keep English (video), but make sure its numbers still match headline.ts for both areas (test exists? add if not)
- [ ] L7 Spanish copy self-review: read every ES table once for tú/usted consistency, accents, and "plan de luz" wording
- [ ] L8 Wall JS weight check (first-load JS for /wall, /plan) vs. last night — note any growth from the word tables
- [ ] L9 docs/STATUS.md refresh before morning handoff
- [ ] L10 Morning handoff file at >= 7:00 AM PT (OVERNIGHT.md) + BOARD row Done + tidy.sh
