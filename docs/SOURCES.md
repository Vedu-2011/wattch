# Sources — every number Wattch shows comes from one of these

Rule: a stat goes here (with a working link, checked) BEFORE it appears in the UI, deck, Devpost or video.

| What | Source | Link | Checked | Used for |
|---|---|---|---|---|
| Every Houston plan + its label link + the state site's 3 prices | Power to Choose CSV export (PUCT) | https://www.powertochoose.org/en-us/Plan/ExportToCsv | Nov 15 2026 (ingest) | the plan list; "the state site's #1" = lowest printed price at 1,000 kWh |
| Why every label prints 500 / 1,000 / 2,000 kWh averages | 16 Tex. Admin. Code § 25.475 (via Cornell LII) | https://www.law.cornell.edu/regulations/texas/16-Tex-Admin-Code-SS-25-475 | planner, Nov 14 — re-check the exact wording before the deck | the self-check |
| Texas seasons (monthly shape) | EIA Form 861M, `sales_revenue.xlsx`, Texas residential sales (MWh) ÷ customers, 2023–2025 (final data) | https://www.eia.gov/electricity/data/eia861m/ (file: https://www.eia.gov/electricity/data/eia861m/xls/sales_revenue.xlsx) | Nov 15 2026, downloaded by Claude Code | `data/seasons.json`; raw rows kept in `data/sources/eia861m-texas.csv`; built by `scripts/seasons.py` |
| Houston seasons (monthly shape) — USED SINCE Nov 15 overnight-2 | ERCOT Backcasted (Actual) Load Profiles 2023, 2024, 2025 (yearly zips → xlsx, one sheet per month, 15-min kWh per profile per day); profiles RESLOWR_COAST + RESHIWR_COAST | https://www.ercot.com/mktinfo/loadprofile/alp | Nov 15 2026, downloaded by Claude Code (zip sha256 2023 742d599d…, 2024 07cf7f8c…, 2025 fe2b962f…) | `data/seasons-houston.json`, monthly extract `data/sources/ercot-coast-residential-monthly.csv`, built by `scripts/houston_seasons.py` |
| How many CenterPoint homes are in each profile | ERCOT "Profile Type Counts" zip → `Profile Type Counts 20261102.xlsx`, sheet Data, rows WEATHERZONE=COAST, TDSPNAME=CENTERPOINT ENERGY | https://www.ercot.com/mktinfo/loadprofile (file https://www.ercot.com/files/docs/2021/10/21/Profile_Type_Counts.zip) | Nov 15 2026 | weights: RESLOWR 1,866,076 + 2,741 = 1,868,817; RESHIWR 650,366 + 193 = 650,559 (`data/sources/ercot-profile-counts-centerpoint-20261102.csv`) |
| Dallas–Fort Worth seasons (added Nov 16) | Same ERCOT Backcasted Load Profiles 2023–2025 (same zips as Houston), profiles RESLOWR_NCENT + RESHIWR_NCENT | https://www.ercot.com/mktinfo/loadprofile/alp | Nov 16 2026, Claude Code (scripts/area_seasons.py; reproduces Houston's shape exactly when run on COAST) | `data/seasons-dallas.json`, extract `data/sources/ercot-ncent-residential-monthly.csv` |
| How many Oncor homes are in each profile (North Central zone) | Same ERCOT "Profile Type Counts 20261102.xlsx", rows WEATHERZONE=NCENT, TDSP=ONCOR ELECTRIC DELIVERY | https://www.ercot.com/mktinfo/loadprofile | Nov 16 2026 | RESLOWR 946,571 + 775 = 947,346; RESHIWR 1,741,919 + 4,009 = 1,745,928 (`data/sources/ercot-profile-counts-oncor-ncent-20261102.csv`, made by scripts/profile_counts.py) |
| Dallas–Fort Worth plan list | Same Power to Choose CSV, TduCompanyName = ONCOR ELECTRIC DELIVERY COMPANY, English | https://www.powertochoose.org/en-us/Plan/ExportToCsv | Nov 16 2026 (172 plans) | `data/plans-dallas.json` |
| Each plan's prices | The plan's own Electricity Facts Label | linked on every plan page | per plan, "read at" time | everything the bill math uses |

## Houston seasons — the numbers (ERCOT Coast profiles, CenterPoint mix, calendar months, 2023–2025)
Shape: Jan 0.708 · Feb 0.627 · Mar 0.671 · Apr 0.780 · May 1.101 · Jun 1.372 · Jul 1.496 · Aug 1.626 · Sep 1.287 · Oct 0.995 · Nov 0.687 · Dec 0.651
→ August ÷ February = 2.59 ("an August bill is about 2.6× a February one"). August ÷ April = 2.08.
Only the SHAPE is used. The profiles' kWh (≈1,335/month mixed) are ERCOT's modeled average home per class, so the
"average home" hint stays on the EIA number below (metered sales ÷ customers).
For comparison: low-winter homes alone Aug 1.69× / Feb 0.56×; high-winter (electric-heat-like) homes Aug 1.44× / Feb 0.84×.
Caveats: profiles are models of a class average, not meter reads; the class split is from one day's counts (Nov 2 2026).

## Dallas–Fort Worth seasons — the numbers (ERCOT North Central profiles, Oncor mix, 2023–2025)
Shape: Jan 1.122 · Feb 0.853 · Mar 0.673 · Apr 0.677 · May 0.891 · Jun 1.257 · Jul 1.418 · Aug 1.528 · Sep 1.157 · Oct 0.851 · Nov 0.693 · Dec 0.880
→ August ÷ February ≈ 1.8; January is above average (65% of Oncor's North Central homes are in the high-winter class, vs 26% of
CenterPoint's). Same caveats as Houston.

## Not used: "Most Houston homes use about N kWh" (checked Nov 16)
Mixing ERCOT's COAST profiles by CenterPoint's home counts gives ≈ 1,335 kWh/month (NCENT/Oncor ≈ 1,355), but I have not
confirmed that ERCOT's backcasted profile values are real per-home kWh rather than a scaled shape, so they are used for
SHAPE only. The usage hint keeps the EIA statewide average (computed in src/lib/seasons.ts from data/seasons.json).

## Texas seasons (old model, replaced) — the numbers (EIA-861M, kWh per residential customer, 3-year average)
Jan 1,140 · Feb 974 · Mar 825 · Apr 798 · May 992 · Jun 1,316 · Jul 1,548 · Aug 1,634 · Sep 1,378 · Oct 1,071 · Nov 821 · Dec 905
→ average 1,117 kWh/month. August ÷ April = 2.05 ("summer uses about twice what spring does").
Shape = each month ÷ 1,117. A user averaging X kWh gets X × shape for each month.

Caveats (say them if asked): statewide Texas, not Houston-only; utilities report by billing month, so each
month partly reflects the month before; real homes vary (a home with gas heat has a flatter winter).

## Outside stats — checked Nov 15–16 2026 (overnight-2, Claude Code)

### VERIFIED — OK to use, with the wording below
- **EnergyBot "98%"** — page "Electricity Plan Study: Comparing Promised vs. Real Rates", https://energybot.com/electricity-plan-study.html
  (opened Nov 16 2026 ~00:05 PT; page shows no date, only "Copyright © 2026"). Exact quotes:
  - "A 2024 survey conducted in the Dallas and Houston areas…"
  - "Despite 87% of surveyed consumers prioritizing cost, 98% did not select the least expensive option when given a choice."
  - "Participants were provided with the supplier name, plan name, and advertised rates."
  - Interval usage data "from 501 participants in the Dallas and Houston metropolitan areas"; "real rates deviate from expected rates by up to 45%".
  - **How to say it:** "In a 2024 EnergyBot survey of Dallas and Houston shoppers, 98% didn't pick the cheapest plan — even though 87% said cost mattered most."
  - **Caveat (say it in the deck):** EnergyBot is a commercial comparison site (paid by providers for referrals, per news coverage — that article
    didn't load for me, so don't quote it). The survey count isn't on the page; 501 is the usage-data sample. Don't call it "501 people surveyed".

## Competitors, the label rule and Texas market size (read Nov 20, 2026 — each company's own pages)
Read with a web-fetch tool on Nov 20 (Power to Choose pages with curl, because it refuses automated fetchers). Quotes are verbatim.
- **EnergyBot** — usage: "Rankings are generated from rate data and a forecasted cost against your actual usage from your
  utility." Money: "EnergyBot is free to use. When you enroll with a provider through our site, that provider pays us a
  referral fee." / "Referral fees do not influence our recommendations." Proof: "we calculate the full bill rather than
  quoting an energy rate alone." — https://www.energybot.com/about/how-energybot-makes-money.html
  Fine print: tells shoppers to "check the electricity facts label" — https://www.energybot.com/electricity-rates/texas/
- **ComparePower** — usage: "can show you a total annual cost for any plan based on your 12 months of usage history."
  Money: "Energy companies pay us a service fee for referring customers, and because we are advocates for the consumer,
  we'll always keep our services free for the user." Label: "Click on the facts label and watch the magic happen." —
  https://comparepower.com/about/ · "be sure to check the facts label carefully" — https://comparepower.com/answers/
- **ElectricityPlans** — usage: "We'll estimate your bills for every month of the year." —
  https://electricityplans.com/texas/tools/billsmart-electricity-shopping-tools/ · fine print: "we review all of the
  details to find the fine print and hidden fees in each electricity plan"; proof: "we show you all the details of how
  your bill is calculated"; money: "We earn compensation from the electricity provider you select when you enroll through
  our platform." / "Consumers like you never pay a fee to use our site." — https://electricityplans.com/faq/
- **Rocket Money** — doesn't compare electricity plans; bill negotiation covers "cable and satellite tv subscriptions,
  internet service providers, cell phone and wireless plans, and home security systems" and is "included in Rocket
  Money's Premium+ tier, which costs $15 per month." — https://www.rocketmoney.com/faq
- **Power to Choose** — "you may use this feature to filter out those plans that feature minimum usage fees/credits and
  tiered rates" and "it is critical that you click the FACT SHEET link and spend time carefully reading the document" —
  https://www.powertochoose.org/en-us/Content/UserGuide · "This website is available to all electric providers to list
  their offers for free." — https://www.powertochoose.org/en-us . Its pages don't state the default sort order; "the
  state site's #1" in Wattch means the lowest printed 1,000 kWh price on its CSV export (row 1 of the table above).
- **16 TAC §25.475(g)(2)(C)** — average prices "must be expressed in cents per kilowatt hour, rounded to the nearest
  one-tenth of one cent"; (g)(2)(C)(i) "For residential customers, 500, 1,000 and 2,000 kilowatt hours per month".
  (c)(4)(A): a provider's website "must prominently display the EFL for any products offered without a person having to
  enter any personal information". — https://www.law.cornell.edu/regulations/texas/16-Tex-Admin-Code-SS-25-475
- **Texas market size** — ERCOT "administers retail switching for 8 million premises in competitive choice areas" and
  serves "more than 27 million Texas customers" — https://www.ercot.com/about ("nearly 8 million premises" on
  https://www.ercot.com/about/profile). Premises include businesses: say "homes and businesses", not "families".
- Not found on any of these sites: referral fee sizes (so no dollar figure in the deck).

### NOT VERIFIED — do NOT use
- **Peltier / Lieber "$480 per family per year" / "~$4B" / "~11M families"** (ARCHITECTURE.md) — 3 searches (authors + figures + Dallas
  Morning News Watchdog) found no such study or article. Different big numbers exist (winter-storm repricing $4.2B, "$16B overcharges",
  a "$28B overpay" report) but they're about other things — don't swap them in.
- Houston "~45% Hispanic" (reason for the Spanish version) — census.gov QuickFacts blocks automated browsers (Cloudflare) and
  the Census API now needs a key, so I couldn't open the page myself. A search summary says QuickFacts shows 44.1% Hispanic or
  Latino and 47.2% speak a language other than English at home (ACS 2019–2023) for Houston city — Vedhanth: open
  census.gov/quickfacts/houstoncitytexas in a normal browser and copy the exact figures here before using them anywhere.

### Our own numbers are the headline anyway
The strongest stat is ours and is reproducible from the repo (`npx tsx scripts/headline.ts`): at 1,100 kWh/month with Houston seasons,
the plan Power to Choose listed first on Nov 16 ranks #69 of 143 and costs $378/yr more than the best plan.

### How the state's list changed (Nov 16 → Nov 20)
Power to Choose's own CSV export (powertochoose.org/en-us/Plan/ExportToCsv), downloaded free on Nov 19 ~10:20 PM PT (= Nov 20, 12:20 AM Texas time, which is the date plan pages show) by
`scripts/delisted.ts` and `npx tsx scripts/refresh.ts` (dry run, no AI): Houston 12 of 172 read plans gone, 76 advertised
price changes; Dallas–Fort Worth 13 of 172 gone, 68 price changes. Overnight on Nov 20 (about 12:20–5:40 AM PT) 4 more Houston plans were missing from the export (Constellation: 12 Month
A/C Protect Plus for 2 Units, 14 + 36 Month Usage Bill Credit, Simple Switch 11). By 7 AM they were back, and two checks
agreed (7:05 and 9:04 AM PT), so they're ranked again → 12 Houston, 13 Dallas, as of Nov 20 9:04 AM PT. The list really does
move day to day. Gone plans: data/delisted.json. On that list Houston's
lowest 1,000 kWh price is SimpleSaver 12 at 6.1¢ (Wattch read it at 6.5¢ on Nov 16), then Simple Saver 3 at 6.2¢;
Dallas's lowest is still Simple Saver 3 at 6.2¢.
