# Business-track deck — Wattch (≤15 slides)

Draft v1 by Claude Code (overnight-2, Nov 16 2026) for the planner to turn into slides. Triple H business track asks
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
- Proof: 171 of 172 ⟲ Houston plans verified. For an average home, the state site's #1 plan ranks #74 ⟲ and costs
  $378 ⟲ a year more than the best.
- Model: free for families; revenue from switch referrals, shown openly and never used to rank.
- Ask: (see slide 14).

**3 · The problem, in one plan**
Simple Saver 3: "6.2¢ ⟲ per kWh" on Power to Choose. The label: a $125 credit only in months above 1,000 kWh.
A Houston home averaging 1,100 kWh misses it 6 months ⟲ a year → $1,712 ⟲ for the year vs $1,334 ⟲ for the best plan.
Visual: the 12-month bars with the 1,000 kWh line (screenshot from /wall).
Source: scripts/headline.ts; the plan's label (linked from /plan/33633).

**4 · People get this wrong**
"In a 2024 EnergyBot survey of Dallas and Houston shoppers, 98% didn't pick the cheapest plan — even though 87% said
cost mattered most." Small print on the slide: "EnergyBot is a commercial comparison site."
Source: energybot.com/electricity-plan-study.html (quoted in SOURCES.md).

**5 · How big the trap is in our data**
18 ⟲ of 172 ⟲ plans have a hidden catch that changes the price; 7 kinds of trap. Breakdown (plans can have more than one):
3-month teaser 20 · autopay credit 15 · bill-credit cliff 12 · minimum-use fee 10 · time-of-use 9 · setup fee 6 · tiered 1 ⟲.
Source: data/plans.json via /traps and src/lib/hero.ts (checked Nov 16). Wording matters: "18 plans with a trap that
makes them cost more than they look" = rankable plans with at least one red ("over") warning (hero.ts). The per-kind
counts are bigger because they include softer catches (autopay credit, 3-month price) — say "catches", not "traps", for those.

**6 · Market opportunity**
- **2,519,376** residential homes in the CenterPoint (Houston) area on ERCOT's load profiles (1,868,817 low-winter +
  650,559 high-winter), Profile Type Counts, Nov 2 2026. Source: ERCOT (SOURCES.md).
- Average Texas home uses about **1,117 kWh a month** (EIA-861M 2023–2025). Source: SOURCES.md.
- **2,693,274** Oncor homes in the North Central weather zone (Dallas–Fort Worth; 947,346 low-winter + 1,745,928
  high-winter), same ERCOT file. Wattch already covers them: 172 ⟲ plans read, 154 ⟲ verified. Together ≈ 5.2 million
  homes in the two areas Wattch reads today. Source: ERCOT (SOURCES.md).
- The same pipeline works for the rest of Texas's competitive market (AEP, TNMP): **[CHECK]** total
  competitive-market homes from an ERCOT/PUCT page before using any statewide number. ("8 million premises" is
  unverified — don't use.)
- Illustration only, our math: if 1% of CenterPoint homes (≈25,000) switched off a plan that costs them $378 more,
  that's ≈ $9.5M a year back to families. Label it "illustration", not a forecast.

**7 · Product (demo slide)**
Screens: home → the wall reading every plan → the reveal → plan page with the fine print highlighted.
One line each: Read every plan · Your real year · Proof for every number · Switch-or-wait math · Share.

**8 · Why you can trust it: AI reads, code decides**
Texas requires each label to print its average price at 500, 1,000 and 2,000 kWh (16 TAC §25.475 — **[CHECK]** exact
wording before the slide). Claude Haiku reads the label; plain code rebuilds those three prices; all three must match to
0.1¢ or the plan isn't ranked. Median read 3.7 s ⟲. 206 ⟲ automated tests.

**9 · Business model**
- Free for families, always. No account needed.
- Revenue 1: referral fee when a family switches through Wattch — the same model the big comparison sites use
  **[CHECK]** (find each one's own disclosure page). Wattch's rule: the ranking is computed before any deal is known
  and never changes for money; the fee is shown on the page.
- Revenue 2 (later): a paid API / white-label for credit unions, apartment managers and nonprofits that help families
  with bills.
- Cost to read every Houston label once: about $0.7 of AI calls (my build logs: one full re-read of changed labels
  cost $0.68). Running cost is tiny.

**10 · Competitors**
| | Ranks by your real year | Reads the fine print | Shows proof | Price to families |
|---|---|---|---|---|
| Power to Choose (state) | No — one price at 1,000 kWh | No | No | Free |
| EnergyBot | **[CHECK]** | **[CHECK]** | **[CHECK]** | Free |
| ComparePower | **[CHECK]** | **[CHECK]** | **[CHECK]** | Free |
| Wattch | Yes — Houston seasons or your own 12 months | Yes — every label | Yes — every number traced to the label | Free |
Fill the [CHECK] cells only after opening each site and trying it; screenshot what you saw.

**11 · Traction / proof**
- Houston: 172 ⟲ labels read, 171 verified, 154 ranked. Dallas–Fort Worth: 172 ⟲ read, 154 verified, 137 ranked
  (same "6.2¢" plan ranks #91 ⟲ there, $530 ⟲ more a year). All public and re-checkable live.
- Reading a whole area costs about $1.15 in AI (0.67¢ a label); unchanged labels cost $0 to re-check.
- English + Spanish on every page (same math, only the words change); contract-end calendar reminders; 206 ⟲ automated tests.
- Accessibility: 0 axe issues on 23 pages (English + Spanish); Lighthouse accessibility 100 on every page tested.
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
**[PLANNER/VEDHANTH DECIDE]** e.g. "$X to launch across Texas: data refresh every night, Spanish, and a pilot with one
Houston nonprofit." Keep the number small and tied to concrete costs.

**15 · Close**
"Texas gave families the power to choose. Wattch gives them the time back." · getwattch.vercel.app · QR to /demo.

---
**Checked (Claude Code, Nov 16):** $378 / #74 / 154 / 172 / 171 / $1,712 / $1,334 / 6 months / $125 — headline.ts.
Trap counts — summary of /traps data (re-run before slides). 2,519,376 — 1,868,817 + 650,559 from SOURCES.md.
1,117 kWh — SOURCES.md. $0.68 re-read — PROGRESS.md A1. 1% illustration: 2,519,376 × 1% × $378 = $9.52M.
