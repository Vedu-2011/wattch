"""Extracts one utility's rows from ERCOT's "Profile Type Counts" workbook into a small CSV.

Source: https://www.ercot.com/mktinfo/loadprofile (Profile_Type_Counts.zip → "Profile Type Counts <date>.xlsx", sheet Data)
Usage: python3 -I scripts/profile_counts.py <xlsx> <TDSP name, e.g. "ONCOR ELECTRIC DELIVERY"> <weather zone, e.g. NCENT> <out.csv>
Writes rows: weatherzone, meterdatatype, tdsp, profiletype, records (same columns as the CenterPoint extract).
"""
import csv, sys, zipfile
import xml.etree.ElementTree as ET

NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
path, tdsp, zone, out = sys.argv[1:5]
z = zipfile.ZipFile(path)
strings = ["".join(t.itertext()) for t in ET.fromstring(z.read("xl/sharedStrings.xml")).iter(NS + "si")]
sheets = sorted(n for n in z.namelist() if n.startswith("xl/worksheets/sheet"))


def cells(el):
    vals = {}
    for c in el.iter(NS + "c"):
        v = c.find(NS + "v")
        t = v.text if v is not None else ""
        if c.get("t") == "s":
            t = strings[int(t)]
        vals["".join(ch for ch in c.get("r") if ch.isalpha())] = t
    return vals


found = []
for name in sheets:
    head = None
    with z.open(name) as f:
        for _, el in ET.iterparse(f):
            if el.tag != NS + "row":
                continue
            r = cells(el)
            el.clear()
            if head is None:
                low = {v.strip().lower(): k for k, v in r.items()}
                if "tdspname" in low or "tdsp" in low:
                    head = low
                continue
            col = lambda *names: next((r.get(head[n], "") for n in names if n in head), "")
            if col("tdspname", "tdsp").strip().upper().startswith(tdsp.upper()) and col("weatherzone").strip().upper() == zone.upper():
                found.append([col("weatherzone"), col("meterdatatype"), col("tdspname", "tdsp"), col("profiletype"), col("records", "count")])
    if found:
        break

with open(out, "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["weatherzone", "meterdatatype", "tdsp", "profiletype", "records"])
    w.writerows(found)
print(len(found), "rows →", out)
for r in found:
    if r[3].startswith("RES"):
        print(r)
