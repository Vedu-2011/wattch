import type { PlanMeta } from "./schema";

export const PTC_CSV_URL = "https://www.powertochoose.org/en-us/Plan/ExportToCsv";
export const HOUSTON_TDU = "CENTERPOINT ENERGY HOUSTON ELECTRIC LLC";

/** The areas Wattch reads. Each is one delivery utility (TDU) on Power to Choose; Houston is the main one. */
export const AREAS = {
  houston: { tdu: HOUSTON_TDU, city: "Houston", utility: "CenterPoint", dataFile: "data/plans.json", textDir: "data/text" },
  dallas: { tdu: "ONCOR ELECTRIC DELIVERY COMPANY", city: "Dallas–Fort Worth", utility: "Oncor", dataFile: "data/plans-dallas.json", textDir: "data/text-dallas" },
} as const;
export type Area = keyof typeof AREAS;
export const asArea = (v: string | null | undefined): Area => (v === "dallas" ? "dallas" : "houston");

/** Small CSV parser that handles quoted fields with commas and quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

/** Power to Choose CSV → Houston (CenterPoint), English listings. */
export function houstonPlans(csv: string): PlanMeta[] {
  return areaPlans(csv, "houston");
}

/** Power to Choose CSV → one area's English listings. */
export function areaPlans(csv: string, area: Area): PlanMeta[] {
  const [head, ...rows] = parseCsv(csv.replace(/^﻿/, ""));
  const ix = (name: string) => head.indexOf(`[${name}]`);
  const g = (r: string[], name: string) => (r[ix(name)] ?? "").trim();
  return rows
    .filter((r) => g(r, "TduCompanyName") === AREAS[area].tdu && g(r, "Language") === "English" && g(r, "FactsURL"))
    .map((r) => ({
      id: g(r, "idKey"),
      provider: g(r, "RepCompany"),
      planName: g(r, "Product"),
      rateType: g(r, "RateType"),
      renewablePct: Number(g(r, "Renewable")) || 0,
      prepaid: g(r, "PrePaid").toLowerCase() === "true",
      timeOfUse: g(r, "TimeOfUse").toLowerCase() === "true",
      eflUrl: g(r, "FactsURL"),
      enrollUrl: g(r, "EnrollURL"),
      website: g(r, "Website"),
      rating: g(r, "Rating") ? Number(g(r, "Rating")) : null,
      ptc: {
        k500: Math.round(Number(g(r, "kwh500")) * 1000) / 10,
        k1000: Math.round(Number(g(r, "kwh1000")) * 1000) / 10,
        k2000: Math.round(Number(g(r, "kwh2000")) * 1000) / 10,
      },
    }));
}
