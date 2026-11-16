# Judge Q&A — short, honest answers

For the live pitch and the Zoom Q&A. Every number is from the repo (`npx tsx scripts/headline.ts`, `data/*.json`, PROGRESS.md)
or from docs/SOURCES.md. ⟲ = changes when the data is refreshed (`npm run refresh`). **[CHECK]** = don't say it until it's sourced.
Say "I" (solo build).

---

**1. How do you know the AI read the label right?**
I don't trust it. Texas makes every label print its own average price at 500, 1,000 and 2,000 kWh. Plain code rebuilds all
three from the numbers the AI read. If all three match to about a tenth of a cent (±0.11¢), the plan is "verified". If not, it's
shown as not verified and never ranked. Houston: 171 of 172 labels verified ⟲. You can watch the check on any plan page.

**2. Then what does the AI actually decide?**
Nothing. It copies numbers off a messy PDF. The bill, the yearly cost, the ranking, the "why" sentence and the questions on each
plan page are all plain code with tests (159 ⟲ tests). Same inputs, same answer, every time.

**3. Why Claude Haiku and not a bigger model?**
The job is reading, not reasoning, and the code check catches mistakes either way. Haiku is fast and cheap enough to read
every plan every night: the full Dallas–Fort Worth read (172 labels) cost $1.15, about 0.67¢ a label (PROGRESS.md, Nov 16).
Unchanged labels aren't re-read at all, because the label text's fingerprint (sha256) is compared first.

**4. What if a provider changes its label tomorrow?**
`npm run refresh` downloads the state's plan list (free) and shows what's new, gone, re-priced or moved. `--apply` re-reads only
the labels whose text changed. The plan page also has "Check this label again now", which re-downloads one label live and
re-runs the check.

**5. What's the headline, exactly?**
An average home (1,100 kWh a month), with Houston's real seasons from ERCOT grid data: the plan Power to Choose lists first,
Simple Saver 3 at "6.2¢", ranks #74 of 154 ⟲ and costs $378 a year more ⟲ than the best plan. Its $125 credit only applies in
months at 1,000 kWh or more, so a normal home misses it 6 months a year. Dallas–Fort Worth: the same plan ranks #84 and costs
$530 more ⟲.

**6. Isn't 1,100 kWh cherry-picked?**
It's close to the EIA's Texas average (1,117 kWh a month, 2023–2025, docs/SOURCES.md). The slider goes from 200 to 3,000 and
you can type your own 12 months. At some usages the state's #1 really is cheap, and Wattch says so — the gap is computed,
not assumed.

**7. Why does the season shape matter?**
Bill-credit plans are priced for a flat 1,000 kWh. Real homes use about 1.8–2.6× more in August than in February ⟲ (ERCOT
backcasted profiles, mixed by how many CenterPoint or Oncor homes are in each profile type). Mild months fall under the
credit line. That's where the money goes.

**8. Who's it for?**
Anyone in Houston or Dallas–Fort Worth choosing a plan, in English or Spanish. No account, no email, nothing saved.

**9. How is this different from Power to Choose or comparison sites?**
Power to Choose sorts by the 1,000 kWh price the provider prints. Wattch prices every plan at your own usage through a real
year and shows the math. Comparison sites: **[CHECK]** — I haven't tested EnergyBot or ComparePower side by side yet, so I
won't claim what they do or don't show.

**10. How would it make money?**
Free for families. The plan: a referral fee when someone switches through Wattch, shown on the page, and computed after the
ranking so money can't change the order. **[CHECK]** referral fee size — not sourced; don't give a dollar figure.

**11. How big is the market?**
ERCOT counts about 2.5 million CenterPoint homes (2,519,376 residential meters in the Nov 2 2026 profile counts) and about
2.7 million Oncor North Central homes (947,346 + 1,745,928). Statewide market size: **[CHECK]**.

**12. Do people really pick the wrong plan?**
In a 2024 EnergyBot survey of Dallas and Houston shoppers, 98% didn't pick the cheapest plan — even though 87% said cost
mattered most. (EnergyBot is a commercial comparison site; the survey size isn't on its page.)

**13. What doesn't it do yet?**
Variable-rate and prepaid plans aren't ranked (their price can change, so a yearly cost would be a guess). Taxes aren't
included. Areas other than CenterPoint and Oncor (AEP, TNMP) aren't read yet. In Dallas, 26 labels ⟲ weren't read because the
scraping service's quota ran out mid-run; they show as "not read" and aren't ranked.

**14. What was the hardest part?**
Labels that don't add up at first: delivery charges folded into other prices, credits written as "1,000.01 kWh", prices hidden
in PDF form fields. Each fix is code, and each fixed plan still has to pass the same three-price check.

**15. What AI tools did you use to build it?**
Claude (claude.ai) for planning and architecture; Claude Code wrote and tested much of the code from my plans; Codex as a
second coding assistant and reviewer before each push; Claude Haiku reads the labels inside the app; Anakin.io opens labels
that need a real browser. Full list in README.md.

---

Before the pitch: run `npx tsx scripts/headline.ts` and update every ⟲ number above.
