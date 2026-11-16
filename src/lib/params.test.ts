import { describe, expect, it } from "vitest";
import { filterOpts, parseWallParams } from "./params";

const from = (q: string) => { const u = new URLSearchParams(q); return parseWallParams((k) => u.get(k)); };

describe("reading a shared result from the URL", () => {
  it("defaults: 1,100 kWh, Houston seasons, no months, no filters", () => {
    expect(from("")).toEqual({ kwh: 1100, seasons: true, months: null, filters: { locked: false, noCliffs: false, green: false, rated: false } });
  });
  it("reads usage, flat, months and every filter", () => {
    const p = from("kwh=1130&flat=1&m=820.700.760.880.1250.1560.1700.1850.1400.1100.780.760&lock=1&nocliff=1&green=1&rated=1");
    expect(p.kwh).toBe(1130);
    expect(p.seasons).toBe(false);
    expect(p.months).toHaveLength(12);
    expect(p.filters).toEqual({ locked: true, noCliffs: true, green: true, rated: true });
    expect(filterOpts(p.filters)).toEqual({ minTermMonths: 12, noCliffs: true, minRenewable: 50, minRating: 4 });
  });
  it("ignores junk", () => {
    const p = from("kwh=99999&m=1.2.3&lock=yes");
    expect(p.kwh).toBe(1100);
    expect(p.months).toBeNull();
    expect(p.filters.locked).toBe(false);
  });
});
