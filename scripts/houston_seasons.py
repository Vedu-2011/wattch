"""Builds Houston's season shape from ERCOT's backcasted residential load profiles for the COAST weather zone.

Source: ERCOT "Backcasted (Actual) Load Profiles - Historical", https://www.ercot.com/mktinfo/loadprofile/alp
Each yearly zip holds one .xlsx with a sheet per month; each row is one profile + weather zone for one day,
with 96 fifteen-minute kWh values (int_kWh1..96). Houston (CenterPoint) homes sit in the COAST weather zone.

Usage: python3 -I scripts/houston_seasons.py <xlsx 2023> <xlsx 2024> <xlsx 2025>
Writes data/sources/ercot-coast-residential-monthly.csv (small, the extract) and data/seasons-houston.json.
Shape = each calendar month's kWh ÷ that year's monthly mean, averaged over the years. Only the shape is used.
"""
import csv, json, sys, zipfile
import xml.etree.ElementTree as ET
from datetime import date, timedelta

NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
PROFILES = ("RESLOWR_COAST", "RESHIWR_COAST")

# Stop before writing anything: with no workbooks it used to overwrite the committed extract with an empty file.
if len(sys.argv) < 2:
    raise SystemExit("Usage: python3 -I scripts/houston_seasons.py <xlsx 2023> <xlsx 2024> <xlsx 2025>\n"
                     "(ERCOT's yearly backcasted load-profile workbooks; nothing was written.)")


def rows(z, name, strings):
    """Each row as {column letters: value}. Empty cells are left out of the XML, so never trust positions."""
    with z.open(name) as f:
        for _, el in ET.iterparse(f):
            if el.tag != NS + "row":
                continue
            vals = {}
            for c in el.iter(NS + "c"):
                v = c.find(NS + "v")
                t = v.text if v is not None else ""
                if c.get("t") == "s":
                    t = strings[int(t)]
                vals["".join(ch for ch in c.get("r") if ch.isalpha())] = t
            el.clear()
            yield vals


totals = {}  # (profile, year, month) -> kWh
days = {}  # (profile, year, month, day) -> [(sheet, quarter-hour kWh)]
for path in sys.argv[1:]:
    z = zipfile.ZipFile(path)
    strings = ["".join(t.itertext()) for t in ET.fromstring(z.read("xl/sharedStrings.xml")).iter(NS + "si")]
    for name in sorted(n for n in z.namelist() if n.startswith("xl/worksheets/sheet")):
        cols = None
        for r in rows(z, name, strings):
            if cols is None:  # header: PType_WZ, Date, int_kWh1 … int_kWh100 (extra intervals on the fall-back day)
                cols = {"name": next(k for k, v in r.items() if v == "PType_WZ"), "date": next(k for k, v in r.items() if v == "Date"),
                        "kwh": [k for k, v in r.items() if v.startswith("int_kWh")]}
                continue
            if r.get(cols["name"]) in PROFILES:
                d = date(1899, 12, 30) + timedelta(days=int(float(r[cols["date"]])))  # Excel serial date
                vals = [float(r[c]) for c in cols["kwh"] if r.get(c)]
                days.setdefault((r[cols["name"]], d.year, d.month, d.day), []).append((name, vals))

# a day can show up on two month sheets (e.g. Sep 1 on the August sheet too): keep one copy, and stop if copies differ
for k, copies in days.items():
    if any(v != copies[0][1] for _, v in copies[1:]):
        raise SystemExit(f"two different copies of {k}")
    vals = copies[0][1]
    if not (88 <= len(vals) <= 100) or max(vals) > 50:  # 92/96/100 quarter-hours; a home never draws 200 kW
        raise SystemExit(f"odd day {k}: {len(vals)} values, max {max(vals)}")
    m = k[:3]
    totals[m] = totals.get(m, 0.0) + sum(vals)

years = sorted({y for (_, y, _) in totals})
with open("data/sources/ercot-coast-residential-monthly.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["profile", "year", "month", "kwh"])
    for k in sorted(totals):
        w.writerow([*k, round(totals[k], 1)])


# how many CenterPoint homes ERCOT assigns to each class (Profile Type Counts, Nov 2 2026), all meter types
counts = {"RESLOWR": 0, "RESHIWR": 0}
for r in csv.DictReader(open("data/sources/ercot-profile-counts-centerpoint-20261102.csv")):
    if r["profiletype"] in counts:
        counts[r["profiletype"]] += int(r["records"])
weight = {"RESLOWR_COAST": counts["RESLOWR"], "RESHIWR_COAST": counts["RESHIWR"]}
n = sum(weight.values())


def mixed(y, mo):
    """kWh in that month for the average CenterPoint home, mixing the two classes by how many homes are in each."""
    return sum(totals[(p, y, mo)] * w for p, w in weight.items()) / n


def shape(month_kwh):
    per_year = []
    for y in years:
        m = [month_kwh(y, mo) for mo in range(1, 13)]
        mean = sum(m) / 12
        per_year.append([v / mean for v in m])
    return [round(sum(py[i] for py in per_year) / len(per_year), 4) for i in range(12)]


avg_month = [sum(mixed(y, mo) for y in years) / len(years) for mo in range(1, 13)]
out = {
    "source": "ERCOT Backcasted (Actual) Load Profiles, residential profiles for the COAST weather zone (Houston), mixed by ERCOT's count of CenterPoint homes in each",
    "url": "https://www.ercot.com/mktinfo/loadprofile/alp",
    "countsUrl": "https://www.ercot.com/mktinfo/loadprofile",
    "years": years,
    "weights": {"RESLOWR_COAST": weight["RESLOWR_COAST"], "RESHIWR_COAST": weight["RESHIWR_COAST"], "countsDate": "2026-11-02"},
    "note": "By calendar month. A profile is ERCOT's modeled average home in that class, not a meter reading of any one home.",
    "kwhPerHome": [round(v, 1) for v in avg_month],
    "shape": shape(mixed),
    "compare": {p: shape(lambda y, mo, p=p: totals[(p, y, mo)]) for p in PROFILES},
}
json.dump(out, open("data/seasons-houston.json", "w"), indent=1)
print("years", years, "weights", weight)
print("CenterPoint mix", out["shape"], "avg kWh/month", round(sum(avg_month) / 12, 1))
for p in PROFILES:
    print(p, out["compare"][p])
