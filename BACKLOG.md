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
- [x] L2 LangSwitch keeps every result param (kwh, area, m, filters, a/b, autopay) when switching — test + live check
- [x] L3 hreflang: each page declares its other-language twin (alternates.languages) so search engines pair them
- [x] L4 global-error.tsx (data file broken) in Spanish when the URL is Spanish — or document why it cannot (no hooks there)
- [x] L5 docs/DECK.md truth pass: Spanish + test counts + Lighthouse numbers vs. the code
- [x] L6 /demo: keep English (video), but make sure its numbers still match headline.ts for both areas (test exists? add if not)
- [x] L7 Spanish copy self-review: read every ES table once for tú/usted consistency, accents, and "plan de luz" wording
- [x] L8 Wall JS weight check (first-load JS for /wall, /plan) vs. last night — note any growth from the word tables
- [ ] L9 docs/STATUS.md refresh before morning handoff
- [ ] L10 Morning handoff file at >= 7:00 AM PT (OVERNIGHT.md) + BOARD row Done + tidy.sh
- [x] M1 Test: for EVERY plan in both areas, the Spanish why-line / bill notes / questions carry exactly the same numbers as the English ones (digits extracted and compared)
- [x] M2 Spanish pages at 320px (small phones): no sideways scroll on /es, wall, plan, compare, traps, remind, how, sources
- [x] M3 Projector check: Spanish wall + plan at 1920 — longer Spanish words do not break the big number or cards
- [x] M4 Regenerate gallery image 8 (en-espanol) after the crédito wording fix; check caption still true
- [x] M5 Codex review 10 (L1–L8 + M diff)
- [x] M6 README "Run it" commands: run each free one, fix any that fail or are stale
- [x] M7 Spanish .ics: parse the generated file (line folding, UTF-8 accents, CRLF) — test
- [x] M8 Lighthouse /sources?lang=es + /compare?lang=es (now with descriptions) — log
- [x] M9 Spanish navigator.share text: check the exact text that gets copied on Spanish Houston + Dallas results
- [x] M10 Print view: the "(hace 1 hora)" relative time is stale on paper — show the date only in print, both languages
- [x] N1 Loading skeletons (loading.tsx): any visible English text while a Spanish page loads? Fix or confirm text-free
- [x] N2 /plan/<unknown id> answers HTTP 200 with the 404 page (known limit) — check if Next 16 can send a real 404 cheaply; fix or document
- [x] N3 Reader-replay tiles clip long plan names — make sure the full name is still available (title / accessible name)
- [x] N4 Commit the width checker as scripts/widths.mjs (320 + 1920, EN + ES) so the 320px fix stays fixed; run it on English pages too
- [x] N5 Keyboard-only pass on the Spanish plan page + compare page (focus visible, LiveCheck + Print reachable)
- [x] N6 <html lang> is "en" on Spanish pages (pages set lang on their own wrapper) — check what screen readers/SEO see; fix only if cheap and safe, else document
- [x] N7 Codex review 11 (fb2a17c..HEAD)
- [x] N8 Anakin quota probe again (~05:00); if back, run the Dallas re-read under PAID-API LOCK (≤ $0.30)
- [x] N9 docs/JUDGE-QA + DEVPOST ⟲ numbers re-verified against scripts/headline.ts (both areas)
- [x] N10 SCRIPT.md scene 9: the "Already on a plan?" answer + top-8 chip layout changed tonight — re-check the clicks and words still match the screen
- [x] O1 Spanish social tags (og/twitter) checked on 4 pages — all Spanish. /es description named only Houston → both areas; meta-check now requires both home descriptions to name both areas
- [x] O2 SCRIPT 10c live at 1920: on results click Español → big number + "más al año" visible without scrolling; English click returns
- [x] O3 Top-8 at 1920 after the chip-row change: rows still fit the video framing for scenes 5–6 (screenshot, compare with gallery)
- [x] O4 sitemap.xml + robots.txt (none exist): main pages in both languages, both areas; /demo stays noindex
- [x] O5 Reduced motion on the Spanish results: count-up and wall walk skip animation (prefers-reduced-motion)
- [x] O6 Spanish /remind end-to-end in Chrome: type a date, get the .ics (Spanish file name? Spanish text), friendly Spanish errors
- [x] O7 /api/card with bad or missing params (kwh=abc, area=xx, lang=fr): still a valid image, never a stack trace
- [x] O8 Lighthouse: Dallas Spanish plan page + /remind?lang=es — log
- [x] O9 Codex review 12 after O batch
- [ ] O10 PROGRESS.md: one-paragraph "night 2 summary" at the top of tonight's section for the planner

## P batch (added 02:50, night 2)
- [x] P1 Spanish /compare: two plans side by side in Spanish at 375 + 1440, numbers match English (screens)
- [x] P2 /sitemap + /robots: add a meta-check rule (robots disallows /demo, sitemap parses, every plan id present)
- [x] P3 Card: Spanish card for a negative/zero gap (state #1 is already best) — wording check
- [x] P4 Spanish /traps?area=dallas at 320: no overflow, every trap kind has a Spanish name
- [x] P5 Error states in Spanish: /plan/does-not-exist?lang=es + /api/live failure copy, screen
- [x] P6 JUDGE-QA: add Q on 'how do you keep Spanish numbers identical' (point at i18n.numbers.test.ts)
- [x] P7 DEVPOST: mention sitemap/hreflang only if it fits in one line; verify claims vs code
- [x] P8 Bundle check: did the header Suspense changes add JS to / ? (build output First Load JS before/after)
- [x] P9 axe on /remind?lang=es with an error showing (role=alert, lang)
- [x] P10 Re-run headline.ts + compare to SCRIPT ⟲ numbers (data unchanged? log)

## Q batch (added 03:01, night 2)
- [x] Q1 Compare page: on the Spanish compare, check the bar chart month labels + legend at 320 (screens)
- [x] Q2 Wall at 320 with every filter on, EN + ES: chips + sticky CTA don't cover the answer
- [x] Q3 Plan page print in Spanish after the compare-table change (still 1 page?)
- [x] Q4 Keyboard: Spanish /compare — tab order reaches both 'Leer su letra pequeña' links + the table region
- [x] Q5 Share text (Web Share / copy) for Dallas Spanish: names Dallas–Fort Worth, Spanish words
- [x] Q6 /how?area=dallas&lang=es: the 'last read' box shows Dallas numbers (154 verified), not Houston
- [x] Q7 tests: compare table — a test that both plans' monthly totals add up to the yearly totals shown
- [x] Q8 README: AI tools list still complete (Claude Code, Codex, Claude Haiku, Anakin) — check vs code
- [x] Q9 Lighthouse /compare?lang=es at mobile after the table change
- [x] Q10 Codex review 13 after Q batch

## R batch (added 03:07, night 2)
- [x] R1 Docs test counts 206→209 (DEVPOST, DECK, JUDGE-QA) + re-count axe pages
- [x] R2 Compare table region: drop tabIndex when the table no longer scrolls? (axe/keyboard rules — decide + log)
- [x] R3 Compare at 1920 (projector): chart + table readable, screenshot for the deck
- [x] R4 Spanish /compare share/print: does Imprimir exist there? if not, log; print 1 page check
- [x] R5 Wall Dallas Spanish at 1920: reveal + top-8 screenshot for the deck (Dallas beat 10b)
- [x] R6 /es home at 320 + 1920 after the static-header change: no layout shift from the switch (CLS)
- [x] R7 meta-check: /compare?lang=es title/description Spanish (add to spanish list if missing)
- [x] R8 scripts/es-walk.mjs: add /compare stop if missing
- [x] R9 STATUS.md: add tonight's fixes list (Codex 11, sitemap, compare phone table/chart)
- [x] R10 Codex review 14 after R batch

## S batch (added 03:18, night 2)
- [x] S1 Tiles at 375 (phone wall): the short ✓/?/– tiles — any with no accessible name? (axe passes; check title/aria)
- [x] S2 Plan page at 320 Spanish: bill lines + highlight table no overflow (widths covers page; check inner tables)
- [x] S3 /traps 1920 screenshot per trap kind for the deck (Houston EN)
- [x] S4 Long provider names on plan page header at 320 (longest provider in data) — wraps cleanly?
- [x] S5 Wall 'notRanked' variable plans note in Spanish — wording check
- [x] S6 /remind at 320 Spanish with a long plan name in ?plan= (80 chars) — no overflow
- [x] S7 Home trap card rotation in Spanish: every trap card text Spanish, numbers match English
- [x] S8 JUDGE-QA: add Q 'What did you check that a user never sees?' (sitemap, print, keyboard, 320px) — short
- [x] S9 OG image for /compare (if it uses the default card, log; else check Spanish)
- [x] S10 Codex review 15 after S batch

## T batch (added 03:30, night 2)
- [x] T1 Share-card preview for a /plan link: should it show that plan (not the generic card)? decide + log (no build if big)
- [x] T2 /api/card?lang=es&area=dallas default card: Spanish city line reads naturally (screen)
- [x] T3 English pages: same label sweep as S1 (no Spanish leaking into English aria-labels)
- [x] T4 Wall progress bar: aria-valuetext ('84 of 172') in both languages
- [x] T5 Footer at 320 Spanish: no wrap mess (screen)
- [x] T6 Plan page 'Check this label again' button at 320 Spanish: text fits
- [x] T7 Remove dead code: grep for exported-but-unused helpers after tonight (ts-prune style via grep), log only unless trivial
- [x] T8 Lighthouse / and /es once more after header + Kapi changes
- [x] T9 PROGRESS night-2 summary draft (feeds O10)
- [x] T10 Codex review 16 after T batch

## U batch (added 03:38, night 2)
- [x] U1 Plan card: test that the card's rank/gap equal the plan page's (shared function, both areas, 3 plans)
- [x] U2 Compare preview card: show the two plans + who saves what (like T1), EN/ES
- [x] U3 DEVPOST/DECK: one line about link previews per plan (only if it fits; verify)
- [x] U4 /wall?m=…(own months) Spanish at 375: months editor + chips fit
- [x] U5 SCRIPT scene 11: the share card now shows the result card; check wording still true
- [x] U6 axe on /api-backed error page /plan/xyz?area=dallas&lang=es
- [x] U7 Re-run es-walk + widths + meta-check + axe as one 'all checks' script (scripts/check-all.mjs) for the morning
- [x] U8 README: 'How to check' section lists check-all
- [x] U9 Lighthouse /plan/33633 EN after card change (no perf hit)
- [x] U10 Codex review 17 after U batch

## V batch (added 03:53, night 2)
- [x] V1 Card route: skip the general reveal() when a plan/compare card is returned (wasted work per preview)
- [x] V2 Card cache header: plan/compare cards same max-age; confirm Vercel caches by full query (doc only)
- [x] V3 Plan + compare cards: footer line (getwattch.vercel.app) on compare card like the others
- [x] V4 Test: card route returns image/png for plan=, a=&b=, bad ids (route test, no pixel check)
- [x] V5 /remind preview card: generic card ok? (decide, log)
- [x] V6 JUDGE-QA: 'what does a shared link show?' — only if Q list < 22
- [x] V7 SCRIPT scene 11 optional line: 'a plan link shows that plan' (+5 s) — only if under cap
- [x] V8 STATUS.md: add U batch (previews, check-all, standing test)
- [x] V9 widths.mjs: add /compare Dallas pair + own-months URL
- [x] V10 Codex review 18 after V batch

## W batch (added 03:56, night 2)
- [x] W1 Gallery: regenerate docs/gallery images if any page they show changed tonight (compare table/chart, tiles) — compare before/after
- [x] W2 Demo (/demo): still matches results after tonight (numbers + steps), 1920 screen
- [x] W3 Wall: 'Compare with #1' links carry own months + filters (open one, check compare uses same months)
- [x] W4 Plan page at 1920: the new preview doesn't change page; screenshot for deck (Simple Saver 3)
- [x] W5 Keyboard: Print button on compare reachable + has visible focus
- [x] W6 i18n parity test covers the new card words (W.en vs W.es keys)
- [x] W7 JUDGE-QA Q21 number check: #74/154/$378 still true after any data refresh (none tonight) — log
- [x] W8 check-all on 1440 only? no — confirm runtime < 3 min; log
- [x] W9 README: link-preview feature one line
- [x] W10 Codex review 19 after W batch

## X batch (added 03:59, night 2)
- [x] X1 Gallery: DEVPOST lists the gallery captions — still match the new images? (check text vs images)
- [x] X2 Plan page: 'Share' button? plan pages have no share button — decide (cheap: reuse ShareButton with plan text) + log
- [x] X3 Compare page: share button too? (same decision)
- [x] X4 /how: mention 'every number on a share card comes from the same code' only if true + short
- [x] X5 Card route: Dallas plan ids with ?area=houston on the card URL itself (not via page) → falls back? decide
- [x] X6 Remove the duplicate cache-header literal if any remains; grep 'max-age' across src
- [x] X7 es-walk: add a Dallas compare stop
- [x] X8 axe: add /compare Dallas + own-months wall pages (like widths)
- [x] X9 PROGRESS: tidy nothing (append-only) — instead write morning 'how to review' list for Vedhanth in STATUS (5 bullets, plain words)
- [x] X10 Codex review 20 after X batch

## Y batch (added 04:11, night 2)
- [x] Y1 Share button: hidden when printing? (print preview check on plan page)
- [x] Y2 Share button keyboard focus ring + axe on clicked state
- [x] Y3 Results page 'read on … CT' in Spanish reads naturally ('16 nov, 1:03 a. m. CT')? decide
- [x] Y4 Fresh.tsx/plan page/how: all dates Texas time now — grep for any other toLocale without timeZone
- [x] Y5 DEVPOST: one line about the Share button? only if it fits the 'Share it' bullet
- [x] Y6 SCRIPT: no change unless a scene shows the old header row (check scene list)
- [x] Y7 Lighthouse /compare EN after Share button (CLS)
- [x] Y8 Demo /demo unaffected by date change (it shows read date?)
- [ ] Y9 Final STATUS refresh before handoff (counts, commits)
- [x] Y10 Codex review 21 after Y batch

## Z batch (added 04:12, night 2)
- [x] Z1 ShareLink unit-ish test: label EN/ES (render to string) — or skip if no React test setup; decide
- [x] Z2 Plan page Share title includes plan name — confirm share sheet text on phone emulation (navigator.share args)
- [x] Z3 Compare share title: 'A vs B · Wattch' instead of plain 'Wattch'
- [x] Z4 sitemap: no change needed for share (log)
- [x] Z5 README 'Share card' line mentions Share buttons
- [x] Z6 es-walk: click Compartir on plan page, check Spanish confirmation
- [x] Z7 check-all comment says 25 pages (done?) — verify header text
- [x] Z8 PROGRESS night-2 summary draft: add W–Z lines
- [x] Z9 BOARD row: update task text (still overnight)
- [x] Z10 Codex review 22 after Z batch

## AA batch (added 04:14, night 2)
- [x] AA1 Plan page on a plan with no rank (variable): card falls back + Share still shown? check /plan/<variable id>
- [x] AA2 Compare with one unverified plan: page + card behave (friendly message, general card)
- [x] AA3 /api/card?plan=<variable> returns general card (route test case)
- [x] AA4 Spanish Share title: 'Simple Saver 3 · Wattch' ok in ES (proper noun) — log
- [x] AA5 Home badge date at midnight CT edge: builtAt 05:30 UTC shows previous Texas day — test for the formatter
- [x] AA6 JUDGE-QA: date honesty line? (no — log)
- [x] AA7 PROGRESS: Anakin probe result (N8) feeds the Dallas re-read decision
- [x] AA8 STATUS 'Known gaps' refresh (Dallas 16 unread, Vercel limit)
- [x] AA9 tidy: docs/screenshots/overnight-2 size check (repo weight) — log MB
- [x] AA10 Codex review 22 after AA batch

## AB batch (added 04:20, night 2)
- [x] AB1 Plan page for a variable plan: does it show a firm yearly cost anywhere? (same honesty rule as compare)
- [x] AB2 Plan page for the not-verified plan (33670): bill shown? labelled as not checked?
- [x] AB3 /wall unranked list: variable plans shown with a firm number anywhere?
- [x] AB4 Traps page: any trap example uses a variable plan's yearly cost?
- [x] AB5 Remind page for variable-plan users: copy mentions month-to-month? (check only)
- [x] AB6 notFirm used by plan page too if AB1 finds a gap
- [x] AB7 JUDGE-QA Q13 mentions compare note for variable plans? (only if AB1–4 changed things)
- [x] AB8 es-walk stop on variable compare page (note in Spanish)
- [x] AB9 meta-check: variable compare link's og:image (fine either way) — log
- [x] AB10 Codex review 23 after AB batch

## AC batch (added 04:24, night 2)
- [x] AC1 'I'm already on a plan' (CurrentPlan): picking a variable plan → note like plan page? check
- [x] AC2 Plan page plan card (/api/card?plan=variable) = general card (verify image) — log
- [x] AC3 Sitemap: variable/unverified plan pages still listed (fine) — log
- [x] AC4 STATUS 'Since 04:20' section (honesty notes)
- [x] AC5 DEVPOST: 'honest about what it can't price' line? only if it fits
- [x] AC6 Print plan page with the note (one sheet still?)
- [x] AC7 Dallas variable plan page check (area words)
- [x] AC8 widths: add a variable plan page at 320
- [x] AC9 Lighthouse /plan/24977 a11y (note contrast on dark card)
- [x] AC10 Codex review 24 after AC batch

## AD batch (added 04:26, night 2)
- [x] AD1 Results page: unranked note (rankNote) still says the right count for Dallas ES
- [x] AD2 Plan page 'Check this label again now' on variable plan: works / friendly (no paid call — just the UI state)
- [x] AD3 404 for /plan/<unknown>?lang=es&area=dallas: links keep area+lang
- [x] AD4 Home trap carousel: each card links to a ranked plan? (variable plan in carousel would contradict)
- [x] AD5 Trap guide examples: any plan not ranked? (same rule)
- [x] AD6 /how mentions the rough-guide rule? one sentence if missing
- [x] AD7 Remind page ics file name for EN (wattch-reminder-<date>.ics) sanity
- [x] AD8 Footer links on every page keep lang (spot check 3 pages)
- [x] AD9 Keyboard skip link (if any) works in ES
- [x] AD10 Codex review 25 after AD batch

## AE batch (added 04:30, night 2)
- [x] AE1 es-walk: Tab once on /es and expect 'Saltar al contenido'
- [x] AE2 Skip link on /demo (projector walk-through) — hidden, doesn't interfere with arrow keys
- [x] AE3 Print: skip link never prints
- [x] AE4 JUDGE-QA Q20 'keyboard-only use' mention skip link (few words)
- [x] AE5 STATUS: skip link line
- [x] AE6 Results page focus after 'Read every plan' (home form) — lands somewhere sensible?
- [x] AE7 Compare page h1 focus after Compare link? (log only)
- [x] AE8 Lighthouse / and /es after skip link (a11y 100)
- [x] AE9 Wall filters: keyboard order sensible at 375 (Tab through 10 stops, log)
- [x] AE10 Codex review 26 after AE batch

## AF batch (added 04:33, night 2) — claim audit
- [x] AF1 DEVPOST: every number (172/171/154/$378/#74/$530/#91/137/18 traps/7 kinds/$1.15/230 tests) vs headline.ts + app
- [x] AF2 DECK.md: same audit
- [x] AF3 JUDGE-QA: same audit (⟲ numbers)
- [x] AF4 SCRIPT.md numbers vs app
- [x] AF5 README numbers vs app
- [x] AF6 Fix any stale number found (log old → new)
- [x] AF7 'seven kinds of traps' = trapGuide count both areas?
- [x] AF8 '18 with a usage trap' (home) = hero withTrap Houston; Dallas value logged
- [x] AF9 STATUS: claim audit result line
- [x] AF10 Codex review 26 (covers AE + AF)

## AG batch (added 04:34, night 2)
- [x] AG1 Home page in Dallas mode: '14 with a usage trap' shown (matches audit)?
- [x] AG2 Dallas trap guide shows 7 kinds with Dallas examples
- [x] AG3 DEVPOST mentions Dallas trap count? (only if a line already lists Houston's 18)
- [x] AG4 Home carousel Dallas: 5 cards, no Houston plan names
- [x] AG5 JUDGE-QA: 'what are the traps' question exists? add short Q22 if not
- [x] AG6 Plan page questions in ES for a trap plan (spot check one)
- [x] AG7 Wall 'Show me why' bars ES labels (months)
- [x] AG8 /traps print: one or two sheets? log
- [x] AG9 STATUS final counts
- [x] AG10 Codex review 27 after AG batch

## AH batch (added 04:35, night 2) — speed
- [x] AH1 Lighthouse mobile /wall?kwh=1100 + /plan/33633: LCP element + what delays it
- [x] AH2 Plan page JS size: what ships (label text in RSC payload twice?)
- [x] AH3 If the label text is sent twice (HTML + RSC), see if one copy can go (no behavior change)
- [x] AH4 Fonts: preloaded? count of font files on first load
- [x] AH5 Images: Kapi svg inline vs file; any big image on home
- [x] AH6 /wall initial HTML size (172 tiles) — log
- [x] AH7 Any fix from AH1–AH6 → re-run Lighthouse, log before/after
- [x] AH8 STATUS speed line
- [x] AH9 Don't change animations/demo timing (log)
- [x] AH10 Codex review 27 after AH batch

## AI batch (added 04:37, night 2) — bad inputs
- [x] AI1 /wall?kwh=0, -5, 99999, abc, 1e9 → friendly, no crash, sensible clamp
- [x] AI2 /compare?a=nope&b=37797, a only, same id twice, a=Dallas b=Houston → friendly
- [x] AI3 /plan/<huge id>, /plan/%00, /plan/../ → 404 page, no stack
- [x] AI4 /remind?end=garbage, end=1900-01-01, end=2099-12-31 → friendly
- [x] AI5 /wall?m=1.2.3 (too few months), m=99999×12 → falls back + note?
- [x] AI6 /api/card with 2000-char params → 200 png, no slowdown
- [x] AI7 /api/remind bad input → 400 friendly text, not a stack
- [x] AI8 ?lang=xx and ?area=xx everywhere → English/Houston defaults
- [x] AI9 Fix any crash found; test for it
- [x] AI10 Codex review 27 after AI batch

## AJ batch (added 04:41, night 2)
- [x] AJ1 Compare with invalid pair: noindex too? (same reason) — decide
- [x] AJ2 /wall with kwh clamp: does the usage box show the clamped value (100/5000) so people see why?
- [x] AJ3 Home kWh input: typing 0 or 99999 → friendly hint?
- [x] AJ4 Remind 1900 date: says 'already passed'? (check text)
- [x] AJ5 Remind 2099: ok or 'too far'? decide
- [x] AJ6 sitemap excludes unknown plans (sanity)
- [x] AJ7 JUDGE-QA: 'what if I type something weird' — skip (log)
- [x] AJ8 README: meta-check line mentions noindex check
- [x] AJ9 STATUS: bad-input sweep line
- [x] AJ10 Codex review 28 after AJ batch

## AK batch (added 04:44, night 2) — after-launch risks
- [x] AK1 'Check this label again' (/api/live): no AI call; label URL from Wattch's data (can't be pointed elsewhere); only cost = Anakin fallback for ~14 labels
- [x] AK2 Privacy: 9 pages → no outside requests, 0 cookies, empty localStorage → JUDGE-QA Q8
- [x] AK3 /api/live: same plan hammered 10× → each call re-downloads; add a short cache? decide
- [x] AK4 /api/card: heavy? time 20 cards in a row (log)
- [x] AK5 ANAKIN_API_KEY on Vercel? (can't see; note for planner)
- [x] AK6 Error page (500) Spanish: still untestable — log
- [x] AK7 .env.local not committed (git check-ignore) + no key strings in repo (grep sk-ant)
- [x] AK8 Headers: X-Robots for /demo? robots.txt covers — log
- [x] AK9 STATUS: privacy line
- [x] AK10 Codex review 28 after AK batch

## AL batch (added 04:45, night 2) — demo day
- [x] AL1 /demo at 1280×720 (common projector): every scene fits, no scroll
- [x] AL2 /demo keyboard: ←/→, Home/End? log what works
- [x] AL3 Results page at 1280×720: big number visible without scrolling
- [x] AL4 QR on results/plan page points to the current URL (if QR exists)
- [x] AL5 Zoom share: 1920 with browser zoom 125% — nothing cut
- [x] AL6 Dark room: contrast of yellow on cream (volt on paper) ≥ 3:1 for big text
- [x] AL7 SCRIPT scene timing still ≈ 5:30 (no new scenes) — log
- [x] AL8 Backup: docs/gallery images can stand in if Wi-Fi dies — note in STATUS
- [x] AL9 STATUS demo-day line
- [x] AL10 Codex review 29 if code changed

## AM batch (added 04:50, night 2) — wording
- [x] AM1 Grep all UI words for AI-sounding terms (seamless, leverage, empower, unlock, delve, robust, effortless, journey, elevate, cutting-edge, game-changer)
- [x] AM2 Same for DEVPOST/DECK/SCRIPT
- [x] AM3 'we'/'our' in DEVPOST/SCRIPT (solo build → 'I') — UI 'our math' is the app speaking, fine
- [x] AM4 Exclamation marks in UI (should be none/rare)
- [x] AM5 Fix anything found
- [x] AM6 Spanish: same grep (aprovechar, potenciar, sin problemas, revolucionar)
- [x] AM7 Button labels: verbs, short (list them)
- [x] AM8 Error messages all say what to do next
- [x] AM9 STATUS wording line
- [x] AM10 Codex review 30 if code changed

## AN batch (added 04:50, night 2) — links
- [x] AN1 Every outside link on /sources answers (2xx/3xx)
- [x] AN2 Every link in docs/SOURCES.md answers
- [x] AN3 Plan pages 'Open the original label' links: sample 10 Houston + 10 Dallas answer
- [x] AN4 Enroll links (if shown): sample 5
- [x] AN5 Fix or note broken ones (no invented replacements)
- [x] AN6 /how links
- [x] AN7 README links (repo, live, video)
- [x] AN8 DEVPOST links
- [x] AN9 STATUS links line
- [x] AN10 Codex review 30 if code changed
- [x] AN11 Re-check the 36 Infuse/Revolution label links at ~06:45 (still 404?) → note in handoff

## AO batch (added 04:53, night 2)
- [x] AO1 Try a direct (free) download of the 16 unread Dallas labels — which work without Anakin?
- [x] AO2 If some work: re-read just those (PAID-API LOCK, ≤ $0.30, ingest --redo-failed or equivalent), verify, rebuild
- [x] AO3 After any re-read: headline unchanged? Dallas counts updated in docs
- [x] AO4 Tests + check-all after data change
- [x] AO5 Handoff draft in scratchpad (fill at 7:00)
- [x] AO6 Night-2 summary final text drafted (O10)
- [x] AO7 STATUS: final counts (Y9/AG9) — prepare
- [x] AO8 tidy.sh dry look (what it moves) before running at handoff
- [x] AO9 BOARD Done line drafted
- [x] AO10 Codex review if code changed

## AP batch (added 05:00, night 2)
- [x] AP1 rateType values in data: only Fixed/Variable? (Spanish plan-page mapping covers them)
- [x] AP2 Results page print: how many sheets? hide the tile wall in print if huge
- [x] AP3 /how and /sources print sheets (log)
- [x] AP4 Plan page 'renewable' wording ES for 0%% and 100%%
- [x] AP5 Plan page '1 months' / '0 months' (variable plans showed '1 meses', '0 months') → fix singular/zero
- [x] AP6 Compare page '1 meses' same check
- [x] AP7 Tests for month wording
- [x] AP8 es-walk unaffected
- [x] AP9 STATUS line
- [x] AP10 Codex review 31 after AP batch

## AQ batch (added 05:08, night 2)
- [x] AQ1 Grep other plural slips: '1 plans', '1 traps', '1 labels', '1 kinds' in EN/ES words (n === 1 handled?)
- [x] AQ2 Dallas counts in /how: '2 didn't add up' style sentences singular/plural
- [x] AQ3 'months a year' with 1 ('You'd miss it 1 months a year')
- [x] AQ4 Tests for any fix
- [x] AQ5 Spanish same
- [x] AQ6 Compare 'cheaper in 1 months'
- [x] AQ7 Results 'N variable-rate plans aren't ranked' with N=1
- [x] AQ8 Remind 'in 1 days'
- [x] AQ9 STATUS line
- [x] AQ10 Codex review 32 after AQ batch

## AR batch (added 05:10, night 2) — eyes-on phone review
- [x] AR1 Home ES 375 full page: anything off?
- [x] AR2 Results EN 375 first 2 screens
- [x] AR3 Compare EN 375 (Share/Print row, note, table)
- [x] AR4 Plan EN 375 bill section
- [x] AR5 Fix anything found
- [x] AR6 Same at 1920 for results
- [x] AR7 Dallas home EN 375
- [x] AR8 Traps ES 375
- [x] AR9 STATUS line
- [x] AR10 Codex if code changed

## AS batch (added 05:14, night 2)
- [x] AS1 README: AI tools list complete (STEM2Connect rule): Claude, Claude Code, Codex, Claude Haiku, Anakin.io
- [x] AS2 Dallas unread count says 16 everywhere (DEVPOST, DECK, JUDGE-QA, STATUS, /how)
- [x] AS3 Reduced motion: every CSS animation/transition off under prefers-reduced-motion
- [x] AS4 404 page: friendly, EN + ES, links home
- [x] AS5 Plan page Spanish chart at 320: 'salto' label not clipped
- [x] AS6 Compare page still prints on 1 sheet (Share button row)
- [x] AS7 Lint-like grep: no console.log left in src/
- [x] AS8 No TODO/FIXME in src/ that a judge could see
- [x] AS9 STATUS line
- [x] AS10 Codex review 33 if code changed

## AT batch (added 05:14, night 2)
- [x] AT1 Results slider: aria-valuetext says the kWh (EN/ES)
- [x] AT2 Compare with the same plan twice: friendly message, no crash
- [x] AT3 /remind calendar file: valid ICS (CRLF lines, folded at 75 octets)
- [x] AT4 Sitemap has Dallas plan pages too
- [x] AT5 Share card with the longest plan name (EN/ES): text fits
- [x] AT6 Longest plan name page at 320: no overflow
- [x] AT7 scripts/headline.ts matches the demo numbers ($378/#74, $530/#91)
- [x] AT8 Fix anything found + tests
- [x] AT9 STATUS line
- [x] AT10 Codex review 33 if code changed

## AU batch (added 05:19, night 2)
- [x] AU1 /how page: Dallas numbers current (154 verified, 16 unread) in EN + ES
- [x] AU2 Results empty state (filters exclude every plan): screenshot EN + ES, reads well
- [x] AU3 Plan page 'hand-read' note shows in Spanish too
- [x] AU4 Error page (error.tsx) friendly in EN + ES, has a way back
- [x] AU5 /api/live with a bad id: friendly JSON, right status
- [x] AU6 Keyboard focus ring visible on Share/Print buttons
- [x] AU7 Long Spanish sentences (> 35 words) in word tables: split if any
- [x] AU8 Fix anything found + tests
- [x] AU9 STATUS line
- [x] AU10 Codex review 34 if code changed

## AV batch (added 05:24, night 2)
- [x] AV1 Crawl: every internal link from home, /wall, /how, /sources, /traps, /remind, /demo (EN + ES, Houston + Dallas) answers 200
- [x] AV2 'Check this label again': button disabled + 'Checking…' while it runs (EN/ES)
- [x] AV3 My 12 months form: all blanks / zeros → friendly message, no NaN
- [x] AV4 Remind: a date in the past → friendly message
- [x] AV5 Trap guide example links all open the right plan
- [x] AV6 Plan page at 1920: heading and bill box line lengths sane
- [x] AV7 Compare picker on phones: can find a plan by name
- [x] AV8 Fix anything found + tests
- [x] AV9 STATUS line
- [x] AV10 Codex review 35 if code changed

## AW batch (added 05:25, night 2)
- [x] AW1 'Find your current plan' search: case- and accent-insensitive, finds by provider too
- [x] AW2 Same search: no-results message in EN + ES
- [x] AW3 Results list: #1 doesn't show 'Compare with #1' to itself
- [x] AW4 Dallas plan page in Spanish: delivery line says Oncor
- [x] AW5 /demo?lang=es: every scene in Spanish
- [x] AW6 Results page link preview title/description for Dallas + ES
- [x] AW7 Plan page for a prepaid plan: note reads right EN + ES
- [x] AW8 Fix anything found + tests
- [x] AW9 STATUS line
- [x] AW10 Codex review 36 if code changed

## AX batch (added 05:29, night 2)
- [x] AX1 Results 'Share my result': shared text names the kWh + city, EN/ES
- [x] AX2 Home trap carousel: stops auto-advancing under reduced motion and while focused
- [x] AX3 Home trap carousel: dots reachable by keyboard with names
- [x] AX4 Dallas plan page prints on 1 sheet (EN + ES)
- [x] AX5 Freshness badge in a real browser: 'hace N horas' in ES, Dallas counts on Dallas
- [x] AX6 Results 'Use my real 12 months' button: keyboard + screen-reader name
- [x] AX7 Plan page 'Show same usage every month' link keeps lang + area
- [x] AX8 Fix anything found + tests
- [x] AX9 STATUS line
- [x] AX10 Codex review 37 if code changed

## AY batch (added 05:30, night 2) — does the repo work for someone else?
- [x] AY1 Fresh clone of the overnight branch (scratchpad): npm ci + npm test pass with no .env
- [x] AY2 Every npm script named in README exists in package.json
- [x] AY3 README lists every key the code reads (no .env.example: env files are blocked for me)
- [x] AY4 Every data file the app imports is tracked in git
- [x] AY5 Biggest client JS chunk size (flag if > 300 KB) — 235 KB
- [x] AY6 sitemap/robots/preview links use the production address
- [x] AY7 Anakin quota check at >= 06:00 (PAID-API LOCK, $0 if still out)
- [x] AY8 Fix anything found
- [x] AY9 STATUS line
- [x] AY10 Codex review if code changed

## AZ batch (added 05:31, night 2) — numbers sanity
- [x] AZ1 Every ranked plan, both areas, at 200/1100/3000 kWh: yearly cost finite, > 0, < $10,000
- [x] AZ2 Ranking ties: same yearly cost → stable order (by id), test
- [x] AZ3 Results page at 200 and 3000 kWh renders, no NaN/undefined, EN + ES
- [x] AZ4 Monthly bill never negative at any usage 100–3,000 (credits bigger than the bill?)
- [x] AZ5 Plan pages: 'real ¢/kWh' between 3¢ and 60¢ for ranked plans
- [x] AZ6 DEVPOST/STATUS Codex review count current
- [x] AZ7 Fix anything found + tests
- [x] AZ8 Look at the 3 most extreme plans by hand if anything looks odd
- [x] AZ9 STATUS line
- [x] AZ10 Codex review if code changed

## BA batch (added 05:32, night 2) — keep tonight's probes as tests
- [x] BA1 Test: every ranked plan, both areas: yearly cost finite $0–$10k at 200/1,100/3,000; no bill < $0 from 100–3,000
- [x] BA2 Move the search fold() into src/lib and test it (accents, case, provider)
- [x] BA3 Test: every hand-read parsedBy in data turns into Spanish (matches the date pattern)
- [x] BA4 Test: every plan's label link is https
- [x] BA5 Test: every plan has a non-empty provider + plan name
- [x] BA6 Test: sitemap has no duplicate URLs
- [x] BA7 Full verify (test, lint, build, check-all)
- [x] BA8 STATUS line
- [x] BA9 Codex review 37
- [x] BA10 Docs test counts

## BB batch (added 05:36, night 2) — weight + hygiene
- [x] BB1 HTML size of /, /wall, /plan, /compare (flag > 300 KB)
- [x] BB2 public/ images: any > 200 KB?
- [x] BB3 next build: any warnings?
- [x] BB4 npm audit (prod deps): high/critical? (read-only, no installs)
- [x] BB5 package.json deps all imported somewhere
- [x] BB6 Fonts: only the weights used are loaded
- [x] BB7 Fix anything small found
- [x] BB8 Note bigger ones for the planner
- [x] BB9 STATUS line
- [x] BB10 Codex review if code changed

## BC batch (added 05:37, night 2) — docs match the app
- [x] BC1 SCRIPT.md: every button/label it names exists in the app (EN)
- [x] BC2 DEVPOST: every feature named exists; nothing overclaimed
- [x] BC3 DECK numbers marked ⟲ = scripts/headline.ts output
- [x] BC4 README feature list current
- [x] BC5 Test count 248 consistent across docs
- [x] BC6 STATUS morning check list still accurate
- [x] BC7 Fix anything found
- [x] BC8 STATUS line
- [x] BC9 Codex if code changed
- [x] BC10 PROGRESS line

## BD batch (added 05:41, night 2) — voice sweep
- [x] BD1 App words: no 'we/our' (EN) or '-imos/nuestro' (ES) — Wattch speaks as Wattch
- [x] BD2 DEVPOST/SCRIPT/DECK: solo 'I', no 'we/our'
- [x] BD3 No AI-sounding words in the app (seamless, leverage, empower, delve, robust, unlock)
- [x] BD4 Spanish uses tú everywhere (no usted/su as 'your')
- [x] BD5 No exclamation marks in app copy
- [x] BD6 Fix anything found
- [x] BD7 Tests/parity still pass
- [x] BD8 STATUS line
- [x] BD9 Codex if code changed
- [x] BD10 PROGRESS line

## BE batch (added 05:45, night 2) — plans that didn't check out
- [x] BE1 Not-verified plan page (33670) EN + ES: clear why, no yearly claim, screenshot 375
- [x] BE2 Results wall: not-verified tile has a screen-reader name saying so
- [x] BE3 Traps page with area=dallas shows Dallas counts (14 usage traps)
- [x] BE4 Unread Dallas plan page (couldn't open): friendly, links to the label
- [x] BE5 Not-verified plan: 'Check this label again' still there
- [x] BE6 Compare with a not-verified plan: note shows (covered?)
- [x] BE7 Fix anything found + tests
- [x] BE8 STATUS line
- [x] BE9 Codex if code changed
- [x] BE10 PROGRESS line

## BF batch (added 05:51, night 2) — English leaking into Spanish pages
- [x] BF1 Every Spanish plan page (both areas, all 344): text outside lang="en" parts has no English sentences
- [x] BF2 Spanish compare pages for a sample of pairs (incl. variable, unverified)
- [x] BF3 Spanish results pages with each filter on
- [x] BF4 Fix anything found
- [x] BF5 Add the scan to es-walk if cheap
- [x] BF6 Tests
- [x] BF7 Screenshot one fixed page
- [x] BF8 STATUS line
- [x] BF9 Codex review
- [x] BF10 PROGRESS line

## BG batch (added 05:53, night 2) — unread plans everywhere else
- [x] BG1 Unread plan: link preview title/description honest (no price claim), EN + ES
- [x] BG2 Unread plan: share card falls back to the general card
- [x] BG3 Compare with an unread plan: friendly page (EN + ES)
- [x] BG4 Unread plan page: 'Ask yourself' / bill sections hidden, nothing says $0
- [x] BG5 Unread plans in the sitemap: fine to list? (decide, log)
- [x] BG6 Live re-check on an unread plan: message makes sense
- [x] BG7 Fix anything found + tests
- [x] BG8 STATUS line
- [x] BG9 Codex if code changed
- [x] BG10 PROGRESS line

## BH batch (added 05:57, night 2) — plans whose numbers don't add up (3)
- [x] BH1 Mismatch plan link preview: says its numbers don't add up, not just 'checked' (EN/ES)
- [x] BH2 Mismatch plan page: bill shown with the 'rough guide' note, EN + ES
- [x] BH3 Mismatch plan share card falls back to the general card
- [x] BH4 meta-check covers a mismatch plan
- [x] BH5 /how mismatch count matches data (Houston 1, Dallas 2)
- [x] BH6 Tests
- [x] BH7 Full verify
- [x] BH8 STATUS line
- [ ] BH9 Codex review
- [x] BH10 PROGRESS line

## BI batch (added 06:04, night 2) — previews for edge pages
- [x] BI1 Compare preview with a variable or not-verified plan: no firm 'saves $X' claim (EN/ES)
- [x] BI2 Compare preview with an unread plan / unknown id: generic, honest
- [x] BI3 Results preview when filters exclude every plan
- [x] BI4 /remind preview with a past date
- [x] BI5 Fix anything found
- [x] BI6 meta-check covers what was fixed
- [x] BI7 Full verify
- [x] BI8 STATUS line
- [x] BI9 Codex review
- [x] BI10 PROGRESS line
