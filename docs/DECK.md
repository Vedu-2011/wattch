# Business-track deck — Wattch (≤15 slides)

Final v2 by Claude Code (Nov 19 2026, prompts/final-1.md) for the planner to turn into slides. 15 slides. Triple H business track asks
for: executive summary, market opportunity, business model, the ask; presenter role-plays an executive.
Rule: every number has a source in docs/SOURCES.md or comes from the repo. Anything marked **[CHECK]** is not yet
sourced — don't put it on a slide until it is. ⟲ = changes when the plan data is refreshed.

---

**1 · Title**
Wattch — the fine print, read for you.
Vedhanth M., Founder & CEO · Houston · getwattch.vercel.app

**2 · Executive summary**
- Problem: Houston families must choose an electricity plan, and the state's comparison site ranks plans by a price
  that's only true at exactly 1,000 kWh a month.
- Product: Wattch reads every plan's legally required fine-print label, checks its own reading against the label's
  printed prices, and ranks plans by what they cost over a real Houston year.
- Proof: 171 of 172 ⟲ Houston plans verified. For an average home, the plan the state site listed first (Nov 16) ranks #69 ⟲
  of 139 and costs $378 ⟲ a year more than the best.
- Model: free for families; revenue from switch referrals, shown openly and never used to rank.
- Ask: (see slide 14).

**3 · The problem, in one plan**
Simple Saver 3: "6.2¢ ⟲ per kWh", first on Power to Choose's list when Wattch read it (Nov 16). The label: a $125 credit only in months above 1,000 kWh.
A Houston home averaging 1,100 kWh misses it 6 months ⟲ a year → $1,712 ⟲ for the year vs $1,334 ⟲ for the best plan.
Visual: the 12-month bars with the 1,000 kWh line (screenshot from /wall).
Source: scripts/headline.ts; the plan's label (linked from /plan/33633).

**4 · People get this wrong**
"In a 2024 EnergyBot survey of Dallas and Houston shoppers, 98% didn't pick the cheapest plan — even though 87% said
cost mattered most." Small print on the slide: "EnergyBot is a commercial comparison site."
Source: energybot.com/electricity-plan-study.html (quoted in SOURCES.md).

**5 · How big the trap is in the data**
13 ⟲ of the 143 ⟲ ranked Houston plans have a hidden catch that changes the price; 7 kinds of trap. Breakdown (plans can have more than one):
3-month teaser 20 · autopay credit 15 · bill-credit cliff 12 · minimum-use fee 9 · time-of-use 9 · setup fee 6 · tiered 1 ⟲.
Source: data/plans.json via /traps and src/lib/hero.ts (checked Nov 20, plans that left the list excluded). Wording matters: "17 plans with a trap that
makes them cost more than they look" = rankable plans with at least one red ("over") warning (hero.ts). The per-kind
counts are bigger because they include softer catches (autopay credit, 3-month price) — say "catches", not "traps", for those.

**6 · Market opportunity**
- **2,519,376** residential homes in the CenterPoint (Houston) area on ERCOT's load profiles (1,868,817 low-winter +
  650,559 high-winter), Profile Type Counts, Nov 2 2026. Source: ERCOT (SOURCES.md).
- Average Texas home uses about **1,117 kWh a month** (EIA-861M 2023–2025). Source: SOURCES.md.
- **2,693,274** Oncor homes in the North Central weather zone (Dallas–Fort Worth; 947,346 low-winter + 1,745,928
  high-winter), same ERCOT file. Wattch already covers them: 172 ⟲ plans read, 154 ⟲ verified. Together ≈ 5.2 million
  homes in the two areas Wattch reads today. Source: ERCOT (SOURCES.md).
- The same pipeline works for the rest of Texas's competitive market (AEP, TNMP): ERCOT "administers retail switching
  for 8 million premises in competitive choice areas" (ercot.com/about, read Nov 20; its profile page says "nearly 8
  million"). Say "about 8 million homes and businesses can choose" — premises include businesses, so not "8 million families".
- Illustration only, my math: if 1% of CenterPoint homes (≈25,000) switched off a plan that costs them $378 more,
  that's ≈ $9.5M a year back to families. Label it "illustration", not a forecast.

**7 · Product (demo slide)**
Screens: home → the wall reading every plan → the reveal → plan page with the fine print highlighted.
One line each: Read every plan · Your real year · Proof for every number · Switch-or-wait math · Share.

**8 · Why you can trust it: AI reads, code decides**
Texas requires each label to print its average price at 500, 1,000 and 2,000 kWh (16 TAC §25.475(g)(2)(C):
prices "expressed in cents per kilowatt hour, rounded to the nearest one-tenth of one cent" at "500, 1,000 and 2,000
kilowatt hours per month" for residential customers — checked on Cornell LII, Nov 20). Claude Haiku reads the label; plain code rebuilds those three prices; all three must match to
about a tenth of a cent (±0.11¢; labels round to 0.1¢) or the plan isn't ranked. Median read 3.7 s ⟲. 276 ⟲ automated tests.

**9 · Business model**
- Free for families, always. No account needed.
- Revenue 1: referral fee when a family switches through Wattch — the same model the big comparison sites say they use
  ("that provider pays us a referral fee" — EnergyBot; "Energy companies pay us a service fee for referring customers" —
  ComparePower; "We earn compensation from the electricity provider you select" — ElectricityPlans; links in SOURCES.md).
  Their fee sizes aren't shown on their sites, so the deck gives no dollar figure. Wattch's rule: the ranking is computed before any deal is known
  and never changes for money; the fee is shown on the page.
- Revenue 2 (later): a paid API / white-label for credit unions, apartment managers and nonprofits that help families
  with bills.
- Cost to read every Houston label once: about $0.7 of AI calls (my build logs: one full re-read of changed labels
  cost $0.68). Running cost is tiny.

**10 · Competitors**
Each cell is what that company says on its own site (quotes + links in SOURCES.md, read Nov 20). "Not shown" = their
own pages don't say it — not proof they don't do it.
| | Prices plans at your usage | Reads each plan's fine print for you | Shows the proof behind a price | Paid by | Cost to families |
|---|---|---|---|---|---|
| Power to Choose (state) | No — shows each label's 500 / 1,000 / 2,000 kWh prices; you can filter out usage fees/credits and tiered rates | No — tells you to read the fact sheet yourself | Links each plan's fact sheet | The state (PUCT) | Free |
| EnergyBot | Yes — "forecasted cost against your actual usage" | Not shown (tells you to check the label) | Partly — "we calculate the full bill"; no label or bill lines on its Texas page | Provider referral fees | Free |
| ComparePower | Yes — "total annual cost … based on your 12 months of usage history" | Not shown (puts the label on its site) | Partly — label on site; no bill-line math shown | Provider referral fees | Free |
| ElectricityPlans | Yes (Texas) — "estimate your bills for every month of the year" | Says "we review all of the details to find the fine print" | Partly — "we show you all the details of how your bill is calculated" | Provider compensation | Free |
| Rocket Money | Doesn't compare power plans — negotiates cable, internet, phone and security bills | — | — | Subscription | $15/month (Premium+) |
| Wattch | Yes — Houston/Dallas seasons or your own 12 months | Yes — AI reads every label; code checks it against the label's own 3 prices | Yes — every number traced to the label text | Later: referral fee, shown on the page | Free |
**Say it honestly:** the good comparison sites already price plans at your usage. What Wattch adds is the part none of
them show: every label read for you, checked against its own printed prices, and every number traced back to the fine
print — plus the trap guide and the switch-or-wait math.

**11 · Traction / proof**
- Houston: 172 ⟲ labels read, 171 verified, 143 ranked. Dallas–Fort Worth: 172 ⟲ read, 154 verified, 125 ranked
  (same "6.2¢" plan ranks #82 ⟲ there, $530 ⟲ more a year). All public and re-checkable live.
- Reading a whole area costs about $1.15 in AI (0.67¢ a label); unchanged labels cost $0 to re-check.
- English + Spanish on every page (same math, only the words change); contract-end calendar reminders; 276 ⟲ automated tests.
- Accessibility: 0 axe issues on 27 pages (English + Spanish); Lighthouse accessibility 100 on every page tested.
- Stays honest as the list changes: a free check of the state's list (one command, run by hand; last run Nov 20) marks
  plans that have left it (12 in Houston between Nov 16 and Nov 20) so they're never ranked.
- Built and shipped solo in one week.
(No users yet — say so honestly if asked.)

**12 · Roadmap**
Done this week: Houston · Dallas–Fort Worth · Spanish (every page) · contract-end reminders.
Next: AEP + TNMP areas (rest of Texas's competitive market) · a native speaker's review of the Spanish · nightly automatic re-reads
(`npm run refresh` is ready; needs a scheduler) · a pilot with one Houston nonprofit.

**13 · Team**
Vedhanth M. — founder, built everything (solo). AI tools used: Claude Code, Codex, Claude chat; in the product: Claude
Haiku (Anthropic API), Anakin.io for hard-to-open labels.

**14 · The ask**
**[DECIDE — Vedhanth]** My recommendation: **ask for a pilot, not money.** "I'm looking for one Houston nonprofit or
credit union to pilot Wattch with the families they help with bills this winter, and mentors who know Texas energy
rules." Reason: Wattch has no users yet (slide 11 says so), and an honest, concrete next step scores better with judges
than an unsourced dollar figure. If a dollar ask is required by the track, keep it tied to costs the repo can show:
re-reading every Houston label once ≈ $0.68 in AI (build logs) — so the running cost is tiny and the ask is time and
partners, not cash.

**15 · Close**
"Texas gave families the power to choose. Wattch gives them the time back." · getwattch.vercel.app · QR to /demo.

---
**Checked (Claude Code, Nov 20; labels read Nov 16, departures checked Nov 20):** $378 / #69 / 143 / 172 / 171 / $1,712 / $1,334 / 6 months / $125 — headline.ts.
Trap counts — summary of /traps data (re-run before slides). 2,519,376 — 1,868,817 + 650,559 from SOURCES.md.
1,117 kWh — SOURCES.md. $0.68 re-read — PROGRESS.md A1. 1% illustration: 2,519,376 × 1% × $378 = $9.52M.
