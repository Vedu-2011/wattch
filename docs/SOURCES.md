# Sources — every number Wattch shows comes from one of these

Rule: a stat goes here (with a working link, checked) BEFORE it appears in the UI, deck, Devpost or video.

| What | Source | Link | Checked | Used for |
|---|---|---|---|---|
| Every Houston plan + its label link + the state site's 3 prices | Power to Choose CSV export (PUCT) | https://www.powertochoose.org/en-us/Plan/ExportToCsv | Nov 15 2026 (ingest) | the plan list; "the state site's #1" = lowest printed price at 1,000 kWh |
| Why every label prints 500 / 1,000 / 2,000 kWh averages | 16 Tex. Admin. Code § 25.475 (via Cornell LII) | https://www.law.cornell.edu/regulations/texas/16-Tex-Admin-Code-SS-25-475 | planner, Nov 14 — re-check the exact wording before the deck | the self-check |
| Texas seasons (monthly shape) | EIA Form 861M, `sales_revenue.xlsx`, Texas residential sales (MWh) ÷ customers, 2023–2025 (final data) | https://www.eia.gov/electricity/data/eia861m/ (file: https://www.eia.gov/electricity/data/eia861m/xls/sales_revenue.xlsx) | Nov 15 2026, downloaded by Claude Code | `data/seasons.json`; raw rows kept in `data/sources/eia861m-texas.csv`; built by `scripts/seasons.py` |
| Houston seasons (monthly shape) — USED SINCE Nov 15 overnight-2 | ERCOT Backcasted (Actual) Load Profiles 2023, 2024, 2025 (yearly zips → xlsx, one sheet per month, 15-min kWh per profile per day); profiles RESLOWR_COAST + RESHIWR_COAST | https://www.ercot.com/mktinfo/loadprofile/alp | Nov 15 2026, downloaded by Claude Code (zip sha256 2023 742d599d…, 2024 07cf7f8c…, 2025 fe2b962f…) | `data/seasons-houston.json`, monthly extract `data/sources/ercot-coast-residential-monthly.csv`, built by `scripts/houston_seasons.py` |
| How many CenterPoint homes are in each profile | ERCOT "Profile Type Counts" zip → `Profile Type Counts 20261102.xlsx`, sheet Data, rows WEATHERZONE=COAST, TDSPNAME=CENTERPOINT ENERGY | https://www.ercot.com/mktinfo/loadprofile (file https://www.ercot.com/files/docs/2021/10/21/Profile_Type_Counts.zip) | Nov 15 2026 | weights: RESLOWR 1,866,076 + 2,741 = 1,868,817; RESHIWR 650,366 + 193 = 650,559 (`data/sources/ercot-profile-counts-centerpoint-20261102.csv`) |
| Each plan's prices | The plan's own Electricity Facts Label | linked on every plan page | per plan, "read at" time | everything the bill math uses |

## Houston seasons — the numbers (ERCOT Coast profiles, CenterPoint mix, calendar months, 2023–2025)
Shape: Jan 0.708 · Feb 0.627 · Mar 0.671 · Apr 0.780 · May 1.101 · Jun 1.372 · Jul 1.496 · Aug 1.626 · Sep 1.287 · Oct 0.995 · Nov 0.687 · Dec 0.651
→ August ÷ February = 2.59 ("an August bill is about 2.6× a February one"). August ÷ April = 2.08.
Only the SHAPE is used. The profiles' kWh (≈1,335/month mixed) are ERCOT's modeled average home per class, so the
"average home" hint stays on the EIA number below (metered sales ÷ customers).
For comparison: low-winter homes alone Aug 1.69× / Feb 0.56×; high-winter (electric-heat-like) homes Aug 1.44× / Feb 0.84×.
Caveats: profiles are models of a class average, not meter reads; the class split is from one day's counts (Nov 2 2026).

## Texas seasons (old model, replaced) — the numbers (EIA-861M, kWh per residential customer, 3-year average)
Jan 1,140 · Feb 974 · Mar 825 · Apr 798 · May 992 · Jun 1,316 · Jul 1,548 · Aug 1,634 · Sep 1,378 · Oct 1,071 · Nov 821 · Dec 905
→ average 1,117 kWh/month. August ÷ April = 2.05 ("summer uses about twice what spring does").
Shape = each month ÷ 1,117. A user averaging X kWh gets X × shape for each month.

Caveats (say them if asked): statewide Texas, not Houston-only; utilities report by billing month, so each
month partly reflects the month before; real homes vary (a home with gas heat has a flatter winter).

## Not yet verified — do NOT use until checked
- Peltier / Lieber "$480 per family per year" overcharge study (ARCHITECTURE.md) — link not checked tonight.
- EnergyBot "98% couldn't pick the cheapest plan" — link not checked tonight.
- ERCOT "8 million premises" — not checked tonight.
