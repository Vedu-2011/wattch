"""Builds an area's season shape from ERCOT's backcasted residential load profiles — the same method as
scripts/houston_seasons.py (which made data/seasons-houston.json), for any weather zone.

Source: ERCOT "Backcasted (Actual) Load Profiles - Historical", https://www.ercot.com/mktinfo/loadprofile/alp
Usage: python3 -I scripts/area_seasons.py <ZONE> <counts.csv> <out.json> <extract.csv> "<label>" <xlsx 2023> <xlsx 2024> <xlsx 2025>
  e.g. NCENT data/sources/ercot-profile-counts-oncor-ncent-20261102.csv data/seasons-dallas.json \
       data/sources/ercot-ncent-residential-monthly.csv "North Central weather zone (Dallas–Fort Worth), Oncor homes" …
Shape = each calendar month's kWh ÷ that year's monthly mean, averaged over the years; the two home classes
(RESLOWR, RESHIWR) are mixed by how many of the utility's homes ERCOT puts in each. Only the shape is used.
"""
import csv, json, sys, zipfile
import xml.etree.ElementTree as ET
from datetime import date, timedelta

NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
if len(sys.argv) < 7:  # stop before writing anything (no workbooks would write an empty extract)
    raise SystemExit(__doc__.split("Usage:")[1].split("\n")[0].strip().join(["Usage: ", "\n(nothing was written)"]))
zone, counts_csv, out_json, extract_csv, label, *books = sys.argv[1:]
PROFILES = (f"RESLOWR_{zone}", f"RESHIWR_{zone}")


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
for path in books:
    z = zipfile.ZipFile(path)
    strings = ["".join(t.itertext()) for t in ET.fromstring(z.read("xl/sharedStrings.xml")).iter(NS + "si")]
    for name in sorted(n for n in z.namelist() if n.startswith("xl/worksheets/sheet")):
        cols = None
        for r in rows(z, name, strings):
            if cols is None:
                cols = {"name": next(k for k, v in r.items() if v == "PType_WZ"), "date": next(k for k, v in r.items() if v == "Date"),
                        "kwh": [k for k, v in r.items() if v.startswith("int_kWh")]}
                continue
            if r.get(cols["name"]) in PROFILES:
                d = date(1899, 12, 30) + timedelta(days=int(float(r[cols["date"]])))
                vals = [float(r[c]) for c in cols["kwh"] if r.get(c)]
                days.setdefault((r[cols["name"]], d.year, d.month, d.day), []).append((name, vals))

for k, copies in days.items():
    if any(v != copies[0][1] for _, v in copies[1:]):
        raise SystemExit(f"two different copies of {k}")
    vals = copies[0][1]
    if not (88 <= len(vals) <= 100) or max(vals) > 50:
        raise SystemExit(f"odd day {k}: {len(vals)} values, max {max(vals)}")
    m = k[:3]
    totals[m] = totals.get(m, 0.0) + sum(vals)

years = sorted({y for (_, y, _) in totals})
if not years or any((p, y, mo) not in totals for p in PROFILES for y in years for mo in range(1, 13)):
    raise SystemExit(f"missing months for {PROFILES}")
with open(extract_csv, "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["profile", "year", "month", "kwh"])
    for k in sorted(totals):
        w.writerow([*k, round(totals[k], 1)])

counts = {"RESLOWR": 0, "RESHIWR": 0}
for r in csv.DictReader(open(counts_csv)):
    if r["profiletype"] in counts:
        counts[r["profiletype"]] += int(r["records"])
weight = {PROFILES[0]: counts["RESLOWR"], PROFILES[1]: counts["RESHIWR"]}
n = sum(weight.values())


def mixed(y, mo):
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
    "source": f"ERCOT Backcasted (Actual) Load Profiles, residential profiles for the {label}, mixed by ERCOT's count of homes in each",
    "url": "https://www.ercot.com/mktinfo/loadprofile/alp",
    "countsUrl": "https://www.ercot.com/mktinfo/loadprofile",
    "years": years,
    "weights": {**weight, "countsDate": counts_csv.rsplit("-", 1)[-1].removesuffix(".csv")},
    "note": "By calendar month. A profile is ERCOT's modeled average home in that class, not a meter reading of any one home.",
    "kwhPerHome": [round(v, 1) for v in avg_month],
    "shape": shape(mixed),
    "compare": {p: shape(lambda y, mo, p=p: totals[(p, y, mo)]) for p in PROFILES},
}
json.dump(out, open(out_json, "w"), indent=1)
print("years", years, "weights", weight)
print("mix", out["shape"], "avg kWh/month", round(sum(avg_month) / 12, 1))
