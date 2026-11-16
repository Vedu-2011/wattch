# Wattch — STATUS (Claude Code, overnight-2, updated Nov 16 2026 ~06:35 PT)

Live: https://getwattch.vercel.app (main) · Overnight work: branch `overnight` (Vercel preview, 215 commits ahead of
main, NOT merged — waits for Vedhanth's "merge") · Repo: github.com/Vedu-2011/wattch

## How to check it this morning (5 minutes, on the overnight preview)
1. Open a plan page and press **Share** → paste the link in a chat with yourself: it should show that plan's card.
2. Open **Compare** for the #1 and the best plan → **Share** → the card says who saves how much.
3. Press **Español** on any page → everything changes, including the link preview.
4. Pick **Dallas–Fort Worth** on the home page → the numbers say Dallas, never Houston.
5. Open a Dallas plan Wattch couldn't read (e.g. /plan/31967?area=dallas) → it says "Not read yet", no odd notes.
6. Compare a plan with itself → it says "That's the same plan twice".
7. Say **"merge"** to the planner only after this list looks right.

The preview below stopped updating at ~04:10 (Vercel limit), so it doesn't have items 5–6 or the other fixes since.
To see the newest version, ask the builder to run it on your computer (`npm run build && npx next start`, then open
http://localhost:3000) — that's free and has everything.

Preview link: https://wattch-git-overnight-vedhanth.vercel.app (sign in to Vercel first; it's protected).

**⚠ Vercel build limit (important for "merge"):** the free plan allows 100 builds per 24 hours. I pushed ~170 times
since 10 PM, so Vercel stopped building at ~04:10 ("retry in 24 hours"). The first 100 builds were 10 PM–2:30 AM, so
new builds — **including production after a merge** — will probably be refused until about **10 PM tonight (Nov 16)**.
The newest preview that built is 85e52e2 (~04:00). It is missing everything after that: notes for variable plans,
the skip link, noindex, wording fixes, unread/mismatch plan pages and previews, the phone chart labels. Options for the planner: merge now and let it go live tonight, or
wait. For future overnight nights: push once per batch, or turn off previews for the `overnight` branch.

## Since 04:55 (BACKLOG AN–BO) — the last two hours

**Fixes a user or judge can see**
- **Plans Wattch couldn't read (16 Dallas)** used to show an internal note ("Out of Anakin.io reads for now.", English
  even in Spanish), "read by none", an empty term and a print footer claiming the label was read. Now: "Not read yet:
  Wattch couldn't get the prices out of this plan's fine print" (EN/ES), with the provider's label still linked.
- **Link previews tell the truth:** unread plans say "fine print not read yet"; the 3 plans whose labels don't add up
  say "its fine print doesn't add up" (Codex 41 caught the title). meta-check tests both.
- **"About a tenth of a cent"** everywhere (app EN/ES, /demo, DEVPOST, SCRIPT): the check allows ±0.11¢. A test keeps it.
- **Results button** "Open the #1 plan's fine print" → "Open the state site's #1 fine print" (the card also shows
  "YOUR #1"). Gallery re-taken.
- **Small wording:** "1 month" / "month to month" (were "1 months" / "0 months"); compare with the same plan twice says
  so; Spanish hand-read note "leída a mano por Claude Code"; Spanish "not verified" note in Spanish.
- **Phones + keyboards + screen readers:** bill chart labels readable on phones (were ~5 px); kWh box shows focus;
  slider says "1,100 kWh a month"; links that look the same ("Compare with #1", "Read its fine print") say which plan.
- **Search** "find your current plan" ignores accents ("energia" finds "Energía").
- **Live re-check** says plainly when a provider's label file is really gone.
- **Plans Wattch never read** no longer show "Check this label again now" (it would have said "this label changed since
  Wattch read it", which is false, and could spend a paid read); /api/live answers plainly for them too. One rule
  (src/lib/plans/recheck.ts) for both, tested on every plan. Its test caught my first version also hiding the button on 2
  hand-read Houston labels (no stored fingerprint, e.g. 17330) for ~5 minutes; fixed.

**Checked, nothing to fix**
- All 344 Spanish plan pages scanned for leftover English: clean. 84 internal links all open (EN/ES/Dallas).
- Every ranked plan's numbers are sane at 200/1,100/3,000 kWh (now a test). Keyboard-only flow and an iPhone-sized
  tap-through work. Lighthouse plan + results 100/100/100 (SEO 91: the description is streamed to browsers, bots get it).
- Pages 6–37 KB compressed; no image over 200 KB; 0 npm audit issues; every dependency used; a fresh clone with no keys
  installs and passes the tests. README says which keys go in .env.local (none needed to run the app).
- Tonight's new Spanish re-read (results, plan, compare, traps, home): natural wording, "tú" everywhere (no "usted"
  forms), no missing accents (grep for pagina/energia/numero/ano: none).
- Write-up numbers re-checked against the code at 06:40: axe list = 25 pages; 7 trap kinds; usage traps 18 Houston / 14
  Dallas (real browser); Dallas read $1.149; Houston 172/171/154, #74, $378; Dallas 154 verified/137 ranked, #91, $530. All match.
- Code hygiene at 06:40: no console.log in app code, no .only/.skip tests, no TODO/FIXME added tonight, npm audit 0,
  package.json only gained the `refresh` script (no new dependencies), no key-like strings in tracked files.
- Friendly errors on /remind, "my 12 months", unknown plans; reduced motion; printing (plan, compare, Dallas) on 1 sheet.

**New checks that stay:** src/lib/dataSanity.test.ts, search.test.ts, tolerance.words.test.ts, sitemap duplicates,
and scripts/link-names.mjs in check-all (same-name links, heading levels, <html lang> on 19 pages).
**Quality:** 259 tests · lint + build clean · check-all (5 checks) PASS · Codex 28–45 clean or fixed.

**For the planner**
- A month typed as 0 kWh → −$0.10 (Houston) / −$0.94 (Dallas) on plans whose $5 autopay discount beats the delivery
  fee. Left as the label's math; a $0 floor is a policy call.
- Idea, not built: search plans by name on the results page / compare. /demo stays English-only (presenter page).

## Since 04:20 (BACKLOG AA–AC) — honest about what it can't price
- **Variable, prepaid and not-verified plans** no longer get a firm yearly number anywhere: their plan page and any
  compare page show a plain note ("only a rough guide — that's why it isn't in the ranking"), the link description
  drops "really costs $X a year", and the share card falls back to the general one. Found by opening those plans on purpose.
- **Skip-to-content link** (EN/ES) for keyboard users, hidden until Tab.
- **Wording check (04:55):** no AI-sounding words in the app, Devpost, deck or script (EN + ES); every error
  message says what to do next; deck now says "my math" instead of "our".
- **Demo day:** /demo now fits a 1280×720 or 1366×768 projector (the stage shrinks evenly; 1920 unchanged), and
  Home/End jump to the first/last scene. If the Wi-Fi dies, docs/gallery/ has 8 full-screen images in demo order.
- **Privacy, checked (04:50):** 9 pages, no cookies, nothing in browser storage, no requests to any outside site.
  No API keys anywhere in the repo or its history. "Check this label again" answers are shared by the CDN for 1 minute.
- **Bad-input sweep (04:40):** 21 odd URLs (kWh 0 / -5 / 99999 / abc, bad months, bad plan ids, bad dates, huge
  params): no crashes, friendly words everywhere. Fixed: unknown plan pages now say noindex to search engines.
- **Speed check (04:40):** Lighthouse says ~3 s LCP on plan/results pages, but that's its slow-phone estimate; a real
  4× slower CPU + slow 4G browser shows 0.76 s. Pages are 7–35 KB compressed. No change needed.
- **Claim audit (04:35):** every number in DEVPOST, DECK, SCRIPT, JUDGE-QA and README re-checked against the code
  (headline, trap counts and kinds, $150 fee / 5-month payback, $208 locked, 6.5611¢). All matched; only the check
  tolerance was written as "0.1¢" where the code allows ±0.11¢ — README and DECK now say so.
- **Texas time in one helper** with a test for the midnight edge. Codex 21–23 clean. 230 tests, check-all PASS.

## Since 04:00 (BACKLOG W + X)
- **Share button** on plan and compare pages (next to Print). The button itself says "Link copied".
- **Dates in Texas time:** the home badge and the results "read on" time no longer follow the viewer's own clock.
- **Devpost gallery re-taken** (the old images were missing the Español button, Print and the bill-line notes).
- **Checks grew:** axe now 25 pages, Spanish walk + width check include the Dallas compare page. Codex 18 + 19 clean.

## Since 03:25 (BACKLOG S–V) — link previews + checks
- **Shared links preview the right thing:** every page's preview card is in its own language and city (before: only
  the results page; Spanish pages showed the English card). A plan link shows that plan (advertised vs real yearly cost,
  rank, gap); a compare link shows who saves how much. Tested against the results page (`standing()` = `reveal()`).
- **Screen readers on Spanish pages** no longer hear English (progress bar, header labels, Kapi now decorative); the
  progress bar says "30 of 172" / "29 de 172". es-walk checks labels too.
- **Small fixes found by checking:** compare headers aligned + Print button; Dallas not-found page sent people to
  Houston; months URL comment had the wrong format.
- **`node scripts/check-all.mjs`** runs axe + Spanish walk + widths (40 pages × sizes) + meta-check in ~2 min.
- **Codex 14–17:** 3 real P2s fixed (compare test, preview settings, "cheapest" label), 17 clean.
- **Quality now:** 259 tests · lint + build clean · axe 0 on 25 pages · check-all PASS.

## Since 01:57 (BACKLOG K–R) — polish, found by checking
- **Spanish before JavaScript:** Spanish pages used to send English loading text and `lang="en"` in their first HTML
  (Codex 11) → wordless loading screens + `lang` set before paint; static /es now ships a Spanish header + footer + switch.
- **New:** sitemap.xml (352 URLs, each with its Spanish twin) + robots.txt (keeps /demo and /api out). Caught: Next
  wrote "&" raw into the XML, which made the whole file invalid → escaped, test + meta-check rule.
- **Compare page on phones:** the month table hid the second plan off to the side, and the chart cut off December at
  320px → both plans + all 12 months fit from 320px up; table no longer an empty Tab stop; Print button added.
- **Tiles:** one-word plan names (Dallas "TOUCHDOWN 12") ran under the check badge → they wrap now.
- **Reminder file** is named in Spanish for Spanish users (wattch-recordatorio-<date>.ics), built from the parsed date.
- **Tests that guard the money:** compare totals = results-page totals on real plans (both areas); Spanish numbers =
  English numbers for every plan.
- **Checked, no change needed:** reduced motion, Spanish error states, Spanish /remind download, share card with bad
  inputs (always an image), Dallas share text, print = 1 page (plan + compare, EN + ES), keyboard order, 1920 framing.
- **Codex 11/12/13:** 11 = 2 real P2s (above), 12 + 13 = no findings.
- **Quality now:** 211 tests · lint + build clean · axe 0 on 25 pages · Lighthouse mobile: compare ES 95, remind ES 96,
  Dallas plan ES 94 (SEO 91 is Next's streamed metadata — the description is there; Bing/Facebook get it in <head>).
- **Paid API: still ≈ $2.06 of $3.** Anakin.io still 402.

## Since 01:25 (BACKLOG I + J) — Spanish everywhere
- **Every page a visitor can reach now has Spanish** (?lang=es, or /es): home, wall (incl. "Already on a plan?" and
  "Use my real 12 months" — both were still English), plan, compare, traps, /how, /remind + .ics, 404 + error page,
  share card, /api/live messages. Header/footer + Español/English switch on every page.
  What stays English on purpose: the label text itself and the AI's notes (marked lang="en"), plan + provider names.
- **Checks:** every EN/ES word table has a shape-parity test; scripts/es-walk.mjs clicks /es → wall → plan → compare →
  traps → remind → how → Dallas at 375 + 1440 and flags English lines (16/16 clean); scripts/meta-check.mjs now also
  checks Spanish titles/descriptions (17 URLs clean — it caught Spanish /compare using the English description, fixed).
- **Fixes found on the way:** header freshness badge is per area now; /how "last read" box showed Houston counts with
  no city → per area; bare Dallas /plan/<id> adds area=dallas; Spanish plan page CLS 0.177 → 0.005; an error said
  "I need 12" (the app doesn't speak as "I") → "It takes 12".
- **Codex reviews 7 + 8:** 7 = 1 real P2 (Dallas rescue messages said CenterPoint) fixed; 8 = 1 P2, checked: false
  positive (share text was already per area, tested), hardened anyway.
- **Quality now:** 191 tests · lint + build clean · axe 0 on 22 pages · Lighthouse mobile: plan ES 96, plan EN 99,
  compare 95, traps ES 95, wall ES 92 (perf).
- **Paid API: still ≈ $2.06 of $3.** Anakin.io still out of reads (402) → 16 Dallas labels stay "couldn't open".

## Known gaps (updated 04:20)
- Dallas: 16 labels unread until Anakin quota returns (≤ $0.30 to re-read).
- The error page (not the 404) can't be triggered on demand, so its Spanish is checked by types + lint only.
- Vercel previews paused by the free plan's build limit after ~04:10 (see the top). Not a code problem.
- `.codex/` (someone's Codex setup, 4 files) was swept into commit 6cd891f by my `git add -A`; no secrets, but
  hooks.json has home-folder paths. Now in .gitignore; untracking it needs git's remove-from-index command, which
  tonight's rules leave to the planner.
- Repo weight: tonight's screenshots are 49 MB (309 files in docs/screenshots/overnight-2). Fine for GitHub; the
  planner can decide whether to keep them all.
- Fixed tonight, worth knowing: a hand-typed compare link with a variable-rate plan used to promise a firm yearly
  saving; now the page says it's only a rough guide and the share card doesn't show it.

## Since 00:20 (BACKLOG F + G + H) — the short version
- **Dallas–Fort Worth (Oncor)** works everywhere: city picker on home (stats + trap card switch with no reload), wall,
  plan, compare (mixed-area guard), share card, /traps?area=dallas, Dallas seasons (ERCOT North Central).
  172 plans read → 156 read → **154 verified** → 137 ranked. Same "6.2¢" plan ranks **#91**, **$530/yr** more than
  the best (Just Energy Sustainable Living Bundle - 3, $1,309). 16 Dallas labels unread: 13 = Anakin.io quota ran out,
  2 = Anakin 429, 1 = unreadable. Re-read when quota returns (≤ $0.30).
- **Renewal reminder** /remind (EN + ES): end date → .ics with a reminder 30 days before; nothing stored.
- **Plan page:** one plain sentence under every bill line + "missed credit" box; "Ask yourself before you sign"
  questions from the plan's own label; prints on one Letter page.
- **/how** pipeline diagram with live counts; usage hint in the picker; edge states (0 / 50 / 5000 kWh, all-zero
  months, every filter on) give friendly text, never NaN.
- **One headline source** src/lib/headline.ts (home, wall, card, demo, scripts all agree — tested).
- **`npm run refresh`**: free dry run diffs the state's list; `--apply` re-downloads and re-reads only changed labels.
- **Docs:** DEVPOST/DECK/SCRIPT truth pass (Dallas, reminder, explainer; every number re-run), docs/JUDGE-QA.md
  (15 judge questions, [CHECK] marks), scripts/meta-check.mjs (no "Houston" in Dallas page metadata — 9/9 clean).
- **Quality now:** 164 tests · lint + build clean · axe 0 on 17 pages (375 + 1440) · Lighthouse mobile: /remind and
  /how 96/100/100/100, Dallas wall 93/100/100/90, Dallas traps 94/100/100/100.
- **Paid API tonight: ≈ $2.06 of the $3 cap.** PAID-API LOCK released.

## Known gaps at 01:25 (all fixed since, except the Dallas re-read)
- Header freshness badge shows Houston counts on Dallas pages.
- Plan, compare and traps pages are English only (Spanish: home, wall, reveal, /remind). Backlog item queued.
- Dallas: 16 labels unread (Anakin quota) — shown honestly as "couldn't open".

## Houston numbers (unchanged since 00:20)

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
- **113 tests** (vitest), lint + build clean. axe: 0 issues on 10 pages. Lighthouse mobile: / 96/100/100/100,
  /wall 95 perf (LCP 2.9 s, JS+data 224 KiB), /plan 95/100/100/90 (perf/a11y/best/SEO).
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
- ★ /traps (every kind of catch, a real example priced at 3 usages), ★ /demo (7 auto-advancing scenes for the video,
  ←/→/space), /api/card (★ carries filters, own months and autopay setting), /how, /sources, /api/live (★ tested).
- ★ Reveal: count-up $ number, wall walk animation (answer in ~10 s, reduced-motion respected), Kapi poses.
- ★ 404 / error / global-error (data file fails its zod check → "no prices rather than wrong prices"), loading skeletons,
  favicon/app icon, per-page titles + OG images, sticky "Find my best plan" on phones.
- ★ "Count autopay discounts" off now carries into plan + compare pages (codex review 4 fix).
- Pipeline: ingest.ts (AI read → code check → rescue; ★ Anakin retry, ★ --workers, ★ code slip-fixes,
  ★ Vistra/Octopus label URL fixes, ★ Pronto template), recheck.ts (free), houston_seasons.py, headline.ts.

## Known limits
- Yearly cost uses today's price for 12 months; 3-month plans are tagged "3-month price".
- One-time rebates aren't in yearly cost (notes only). Taxes not included.
- Hand-reads are pinned to the label text they were made from; if a label changes, that plan falls back to "not verified".
- Outside stats (docs/SOURCES.md): EnergyBot 98% VERIFIED (2024 survey, commercial source); Peltier/Lieber $480 NOT found — do not use; ERCOT 8M unchecked.
- /plan/<unknown id> shows the 404 page but with HTTP 200 (Next streams it). Harmless for people.

## Submission docs (★ tonight, drafts for the planner)
docs/DEVPOST.md (every field + gallery captions) · docs/SCRIPT.md (12 scenes, ~4:35 + pauses) · docs/DECK.md (15 slides,
[CHECK] marks on unsourced items) · docs/gallery/ (6 × 1920×1080) · README (AI tools for STEM2Connect/GenHacks).

## Next (BACKLOG H + new)
Spanish plan page · header badge per area · Dallas re-read when Anakin quota is back · codex review 7 ·
for the planner/Vedhanth: fill DECK [CHECK] cells (competitors, referral fee), pick "the ask", decide on merge.
