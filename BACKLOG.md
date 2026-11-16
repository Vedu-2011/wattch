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
- [ ] Oncor/Dallas, AEP, TNMP support (same pipeline, TDU filter) behind a city picker — at least one more area verified
- [ ] "Renewal alarm" page: enter your contract end date → reminder .ics download 30 days before — .ics opens in Calendar
## G. Added overnight-2 (Nov 16, 00:10) — judges + submission strength
- [ ] /how page: one clear diagram of the pipeline (Power to Choose CSV → label → AI reads → code rebuilds 3 prices → verified/ranked) built in plain HTML/SVG, not an image — renders at 375 + 1920, numbers from data
- [ ] "Why is my bill different?" explainer on every plan page: one sentence per bill line (energy, delivery, base, credit) in plain words, generated by code from the plan's pricing — 3 plans checked by hand
- [ ] Data refresh script `npm run refresh` (ingest → check → write plans.json + a short diff report of what changed) documented in README; dry-run mode costs $0 — dry run works
- [ ] Headline numbers in one place: src/lib/headline.ts used by home, /wall, card, demo and scripts/headline.ts (no copies) — test that they all agree
- [ ] Usage hint: "Not sure? Most Houston homes use about N kWh" from EIA number in SOURCES, shown in the picker — sourced
- [ ] Print-friendly plan page (@media print): label proof + bill table on one page — prints on Letter in Chrome's print preview screenshot
- [ ] 1920 projector pass of /demo + /wall reveal: biggest numbers readable at 1920 from "the back of the room" (≥64px for the $ number) — screenshots
- [ ] Empty/edge states: usage 0, 50, 5000 kWh; 12 months all zero; every filter on at once — friendly text, no NaN/Infinity anywhere — tests + screenshots
- [ ] Plan page "Questions to ask before you sign" (from the plan's own traps: credit cliff → "Will I use 1,000 kWh every month?") — code-generated, 3 plans checked
- [ ] docs/JUDGE-QA.md: 15 likely judge questions with honest short answers (accuracy, why Haiku, cost per read, what if a label changes, business model, competitors) — every number sourced
