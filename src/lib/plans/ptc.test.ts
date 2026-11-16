import { describe, expect, it } from "vitest";
import { HOUSTON_TDU, houstonPlans, parseCsv } from "./ptc";

describe("parseCsv", () => {
  it("handles quoted commas, doubled quotes and CRLF", () => {
    expect(parseCsv('a,"b, c","say ""hi"""\r\n1,2,3\r\n')).toEqual([["a", "b, c", 'say "hi"'], ["1", "2", "3"]]);
  });
  it("keeps a last row with no newline and skips blank lines", () => {
    expect(parseCsv("x,y\n\n1,2")).toEqual([["x", "y"], ["1", "2"]]);
  });
});

const HEAD = "[idKey],[TduCompanyName],[RepCompany],[Product],[kwh500],[kwh1000],[kwh2000],[RateType],[Renewable],[PrePaid],[TimeOfUse],[FactsURL],[EnrollURL],[Website],[Rating],[Language]";
const row = (id: string, tdu: string, lang = "English", facts = "https://x.test/efl.pdf") =>
  `${id},"${tdu}",Example Power,"Plan, ${id}",0.192,0.062,0.122,Fixed,6,FALSE,False,${facts},https://x.test/enroll,https://x.test,4,${lang}`;

describe("houstonPlans", () => {
  const csv = "﻿" + [HEAD, row("1", HOUSTON_TDU), row("2", "ONCOR ELECTRIC DELIVERY COMPANY"), row("3", HOUSTON_TDU, "Spanish"), row("4", HOUSTON_TDU, "English", "")].join("\n");
  const plans = houstonPlans(csv);
  it("keeps only CenterPoint, English, with a label link", () => {
    expect(plans.map((p) => p.id)).toEqual(["1"]);
  });
  it("turns $/kWh into cents with one decimal", () => {
    expect(plans[0].ptc).toEqual({ k500: 19.2, k1000: 6.2, k2000: 12.2 });
  });
  it("reads the quoted plan name and the flags", () => {
    expect(plans[0]).toMatchObject({ planName: "Plan, 1", prepaid: false, timeOfUse: false, renewablePct: 6, rating: 4, rateType: "Fixed" });
  });
});
