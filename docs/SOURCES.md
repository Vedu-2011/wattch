# Sources — every number Wattch shows comes from one of these

Rule: a stat goes here (with a working link, checked) BEFORE it appears in the UI, deck, Devpost or video.

| What | Source | Link | Checked | Used for |
|---|---|---|---|---|
| Every Houston plan + its label link + the state site's 3 prices | Power to Choose CSV export (PUCT) | https://www.powertochoose.org/en-us/Plan/ExportToCsv | Nov 15 2026 (ingest) | the plan list; "the state site's #1" = lowest printed price at 1,000 kWh |
| Why every label prints 500 / 1,000 / 2,000 kWh averages | 16 Tex. Admin. Code § 25.475 (via Cornell LII) | https://www.law.cornell.edu/regulations/texas/16-Tex-Admin-Code-SS-25-475 | planner, Nov 14 — re-check the exact wording before the deck | the self-check |
| Texas seasons (monthly shape) | EIA Form 861M, `sales_revenue.xlsx`, Texas residential sales (MWh) ÷ customers, 2023–2025 (final data) | https://www.eia.gov/electricity/data/eia861m/ (file: https://www.eia.gov/electricity/data/eia861m/xls/sales_revenue.xlsx) | Nov 15 2026, downloaded by Claude Code | `data/seasons.json`; raw rows kept in `data/sources/eia861m-texas.csv`; built by `scripts/seasons.py` |
| Each plan's prices | The plan's own Electricity Facts Label | linked on every plan page | per plan, "read at" time | everything the bill math uses |

## Texas seasons — the numbers (EIA-861M, kWh per residential customer, 3-year average)
Jan 1,140 · Feb 974 · Mar 825 · Apr 798 · May 992 · Jun 1,316 · Jul 1,548 · Aug 1,634 · Sep 1,378 · Oct 1,071 · Nov 821 · Dec 905
→ average 1,117 kWh/month. August ÷ April = 2.05 ("summer uses about twice what spring does").
Shape = each month ÷ 1,117. A user averaging X kWh gets X × shape for each month.

Caveats (say them if asked): statewide Texas, not Houston-only; utilities report by billing month, so each
month partly reflects the month before; real homes vary (a home with gas heat has a flatter winter).

## Not yet verified — do NOT use until checked
- Peltier / Lieber "$480 per family per year" overcharge study (ARCHITECTURE.md) — link not checked tonight.
- EnergyBot "98% couldn't pick the cheapest plan" — link not checked tonight.
- ERCOT "8 million premises" — not checked tonight.
