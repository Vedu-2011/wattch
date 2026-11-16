"""Builds data/seasons.json from EIA Form 861M (sales_revenue.xlsx → Texas rows as CSV).
Usage: python3 scripts/seasons.py <texas rows csv>   (columns: Year, Month, State, Status, Revenue k$, Sales MWh, Customers)
Shape = average kWh per residential customer in each calendar month (2023–2025, final data) ÷ the 12-month mean.
"""
import csv, json, sys

YEARS = (2023, 2024, 2025)
rows = [r for r in csv.reader(open(sys.argv[1])) if r and r[0].isdigit() and int(r[0]) in YEARS and r[3] == "Final"]
raw = {}
for r in rows:
    y, m = int(r[0]), int(r[1])
    raw.setdefault(m, {})[y] = {"mwh": float(r[5]), "customers": int(float(r[6])), "kwhPerCustomer": round(float(r[5]) * 1000 / float(r[6]), 1)}
assert all(len(raw[m]) == len(YEARS) for m in range(1, 13)), "missing months"
avg = [sum(raw[m][y]["kwhPerCustomer"] for y in YEARS) / len(YEARS) for m in range(1, 13)]
mean = sum(avg) / 12
out = {
    "source": "U.S. Energy Information Administration, Form EIA-861M (Monthly Electric Power Industry Report), sales_revenue.xlsx, Texas residential sales (MWh) and customers",
    "url": "https://www.eia.gov/electricity/data/eia861m/",
    "years": list(YEARS),
    "note": "Statewide Texas, not Houston only. Utilities report sales by billing month, so each month partly reflects the month before.",
    "kwhPerCustomer": [round(a, 1) for a in avg],
    "shape": [round(a / mean, 4) for a in avg],
    "raw": {str(m): {str(y): raw[m][y] for y in YEARS} for m in range(1, 13)},
}
json.dump(out, open("data/seasons.json", "w"), indent=1)
print("kWh/customer by month:", out["kwhPerCustomer"])
print("shape:", out["shape"], "mean", round(mean, 1))
