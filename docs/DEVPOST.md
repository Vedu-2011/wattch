# Devpost submission — Wattch (Triple H · also STEM2Connect + GenHacks)

Paste each section into the matching Devpost field. Draft v1 by Claude Code (overnight-2, Nov 16 2026) — for the planner
and Vedhanth to edit. Solo "I" voice. Every number below comes from the repo (`npx tsx scripts/headline.ts`,
data/plans.json built Nov 16 2026 07:03 UTC) or a source quoted in docs/SOURCES.md. If the data is re-read before
submitting, re-run headline.ts and update the numbers marked ⟲.

## Project name
Wattch

## Tagline (≤200 chars)
Texas lets you pick your power plan, then hides the real price in the fine print. Wattch reads every Houston plan's label, checks its own work, and shows what each one really costs you.

## Inspiration
In Houston you have to pick your own electricity plan. The state's site, Power to Choose, lists 172 ⟲ of them and shows
one big number for each: the price if you use exactly 1,000 kWh. The catch is in a PDF called the Electricity Facts
Label. Many plans give a $100–$125 bill credit only in months you use more than 1,000 kWh. That makes the advertised
price look amazing, and real homes don't use 1,000 kWh every month. Houston summers blow past it; spring and winter
don't.

People really do get this wrong. In a 2024 EnergyBot survey of Dallas and Houston shoppers, 98% didn't pick the
cheapest plan, even though 87% said cost mattered most. (EnergyBot is a comparison company; the quote and caveats are
in my sources doc.)

I wanted a tool that reads every label so nobody has to, does the math for a real Houston year, and proves every
number it shows. That fits the theme exactly: a more efficient way to live means not paying hundreds of dollars a year
for a number that was never real.

## What it does
- **Reads every Houston plan.** Wattch pulls the full plan list from Power to Choose, opens every plan's fine-print
  label, and reads it. 171 of 172 ⟲ labels check out. The wall of tiles shows each one being read and stamped.
- **Your real year, not one number.** Pick your usage (or type your own 12 months from your bill). Wattch spreads it
  across a real Houston year using ERCOT's grid data — an August bill is about 2.6× a February one — and prices every
  plan month by month.
- **The reveal.** For an average 1,100 kWh home, the plan with the lowest advertised price on Power to Choose (Simple
  Saver 3, "6.2¢") ranks **#74 of 154** ⟲ and costs **$378 a year more** ⟲ than the best plan. Why: its $125 credit
  needs 1,000 kWh, and that home is under 1,000 kWh six months a year. A bar chart shows exactly which months miss.
- **Proof for every number.** Each plan page shows the label text the AI read with every number the math used
  highlighted. Hover a bill line and its number lights up in the fine print. A table shows the label's own three
  prices next to the ones Wattch rebuilt.
- **Tools for real decisions:** compare two plans month by month; filters (price locked 12+ months, no bill-credit
  traps, 50%+ renewable, 4+ stars); "Already on a plan?" does the switching math with your plan's real exit fee and
  says switch or wait; a trap guide with a real example of each of the 7 kinds of catch; "Check this label again now"
  re-opens a label live and says whether anything changed.
- **Share it.** Every result is a link; it unfurls into a card with your own number.
- **Every bill line in plain words.** Under each line of your bill, one sentence says where it comes from ("1,100 kWh ×
  6.5611¢ for CenterPoint's wires to your home"), and a red box says when you just missed a credit and by how much.
- **Ask yourself before you sign.** Each plan page writes up to 4 questions from that plan's own label and your months:
  "Will I use 1,000 kWh or more every single month? With your usage you'd miss it 6 months a year, $750 in all."
- **Dallas–Fort Worth too.** The same pipeline read all 172 ⟲ Oncor plans (154 ⟲ verified) with its own seasons from
  ERCOT's North Central zone. The same "6.2¢" plan ranks #91 ⟲ there and costs $530 ⟲ more a year.
- **En español.** Every page works in Spanish (tap Español, or add `?lang=es`): the results, the plan page, compare,
  the trap guide, reminders and the share card. Same math, only the words change; the label's own text stays as printed.
- **Don't get rolled over.** Enter your contract's end date and get a calendar reminder 30 days before (no account,
  nothing saved). Plan pages also print on one page to take to the kitchen table.

## How I built it
**AI reads. Code decides.** The AI never makes a decision or produces a number on its own.
- **Getting the labels:** the plan list is Power to Choose's CSV export. Most labels are PDFs I open directly
  (158 ⟲); the ones that only load in a real browser go through Anakin.io (14 ⟲). A few providers hide the PDF behind a
  viewer page, so I found the real document endpoint and rewrote those links in code.
- **Reading:** Anthropic's Claude Haiku 5.5 reads each label's text into a strict JSON shape (prices, tiers, delivery
  charges, credits, minimum-use fees, time-of-use hours, exit fee). A median label takes about 3.7 seconds ⟲.
- **Checking:** Texas requires every label to print its average price at 500, 1,000 and 2,000 kWh. Plain TypeScript
  rebuilds those three prices from what the AI read. All three must match to a tenth of a cent, or the plan is not
  verified and never ranked. When it fails, the AI gets one retry with the exact mismatch; after that come code-only
  second chances (some labels keep prices in PDF form fields; one prepaid provider has its own layout) — and every one
  still has to pass the same three-price check.
- **Seasons:** ERCOT's 15-minute residential load profiles for the Coast weather zone (2023–2025), mixed by how many
  CenterPoint homes are in each profile type. That gives the monthly shape; your average sets the size.
- **Deciding:** the bill math, yearly cost, ranking, price cliffs, filters, switching math and every "why" sentence
  are plain code with 164 tests ⟲, including a test that every verified plan still rebuilds its own label.
- **Staying fresh:** `npm run refresh` downloads the state's list for free and shows what changed; `--apply`
  re-downloads every label and only sends the ones whose text changed to the AI. The Dallas read cost $1.15 for 172
  labels, about 0.67¢ each.
- **Stack:** Next.js 16 + React 19 + TypeScript, Tailwind CSS, zod (validates the AI's output and the data file),
  unpdf (PDF text), Vercel. Accessibility checked with axe (0 issues on 17 pages, phone and desktop) and Lighthouse
  (100 accessibility on every page I tested).

## Challenges I ran into
- **Labels that hide.** Some providers show the label in a viewer that only works in a browser. I watched the
  network traffic in headless Chrome, found the real PDF address, and rewrote those links in code.
- **The AI makes small, confident slips.** It read "1,000.01 kWh" as a credit threshold and turned "credited back"
  free hours into negative prices. Because the three-price check catches anything that doesn't add up, I could find each
  slip and fix the pattern in code instead of trusting the AI more.
- **Labels change every day.** Many print today's date, so the file changes even when prices don't. The live re-check
  separates "new file" from "new prices".
- **Seasons.** My first model used statewide Texas data. I replaced it with Houston-area grid data, which made the
  summer/spring gap bigger — and that's exactly where bill-credit plans hurt.
- **Being honest.** One prepaid plan's label prints prices its own charges don't add up to. Instead of forcing it, the
  plan page says exactly what doesn't match.

## Accomplishments that I'm proud of
- 171 of 172 ⟲ Houston plans verified against their own label, to a tenth of a cent.
- Finding that the cheapest-looking plan ranks #74 ⟲ for a typical home, and being able to show why with a bar chart
  anyone understands.
- Every number on screen can be traced back to a line of fine print.

## What I learned
How Texas electricity labels work, how to make an AI useful without trusting it (make it show its work, then check
the work in code), and that the honest answer is often "it depends on your months" — so the tool should ask for them.

## What's next for Wattch
- The other Texas utility areas (AEP, TNMP) — the pipeline is the same; Dallas took one command and $1.15.
- A native Spanish speaker's review of the translations (an AI tool wrote them; tests only check nothing is missing).
- Re-reading every label automatically each night (the refresh script is ready; it needs a scheduler).

## Built with
next.js · react · typescript · tailwind-css · zod · unpdf · anthropic-claude-api (claude-haiku-5-5) · anakin.io ·
vercel · vitest · playwright · axe-core · power-to-choose · ercot-load-profiles · eia

## AI tools used (STEM2Connect + GenHacks require this)
- **Anthropic Claude API, claude-haiku-5-5** — inside the product: reads each label into JSON. Never trusted until code
  rebuilds the label's prices.
- **Claude Code** and **Codex** — coding assistants that wrote and tested most of the code, and reviewed each other.
  Claude Code also wrote the Spanish translations.
- **Claude (claude.ai chat)** — planning, architecture and writing help.
- **Anakin.io** — opens labels that need a real browser (scraping service, sponsor).

## Gallery (docs/gallery/, 1920×1080, upload in this order; captions ≤ 1 line)
1. `1-home.png` — Pick your usage. Wattch has read all 172 ⟲ Houston plans.
2. `2-reading-every-plan.png` — Every tile is a real plan's fine print being read and checked.
3. `3-the-reveal.png` — The state site's #1 plan costs an average home $378 ⟲ more a year, and the bars show why.
4. `4-fine-print-proof.png` — Every number traced back to the label: hover the $125 credit and it lights up in the fine print.
5. `5-side-by-side.png` — The best plan vs the state site's #1, month by month.
6. `6-trap-guide.png` — Every kind of catch Wattch found, each with a real plan.
7. `7-dallas-fort-worth.png` — Dallas–Fort Worth too: the same "6.2¢" plan costs $530 ⟲ more a year there.
8. `8-en-espanol.png` — En español: every bill line explained in plain words, next to the label check.
Retake with `node scripts/gallery.mjs` (or `node scripts/gallery.mjs 7,8` for just the new two) against a local prod build on :3000 if the data changes.

## Links
- Live app: https://getwattch.vercel.app ⟲ (main — merge the overnight branch first if the planner approves)
- Code: https://github.com/Vedu-2011/wattch
- Demo video: (add)

## Checked against the code (Claude Code, Nov 16)
172 plans / 171 verified / 154 ranked / #74 / $378 / 6 months / $125 / 1,000 kWh / 6.2¢: scripts/headline.ts.
158 direct / 14 Anakin / median 3,707 ms: data/plans.json. 7 trap kinds: src/lib/trapGuide.ts. 2.6× Aug/Feb: docs/SOURCES.md.
164 tests: `npm test`. axe 0 on 17 pages: scripts/axe.mjs. Lighthouse a11y 100 on /, /wall, /plan (D2) and /remind, /how,
Dallas wall, Dallas traps (H7): PROGRESS.md.
Dallas (added later Nov 16): 172 plans / 154 verified / 137 ranked / #91 / $530: scripts/headline.ts; $1.149 read cost:
PROGRESS.md (F2). Bill sentence "1,100 kWh × 6.5611¢": src/lib/bill/explain.ts on plan 33633. Questions "6 months, $750":
src/lib/questions.test.ts.
EnergyBot quote: docs/SOURCES.md (verified). NOT used: Peltier/Lieber $480 (couldn't find it).
