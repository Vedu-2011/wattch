import { describe, expect, it } from "vitest";
import { endDateProblem, parseDay, reminderIcs } from "./ics";

const now = new Date("2026-11-16T08:00:00Z");

describe("parseDay", () => {
  it("reads real dates and refuses fake ones", () => {
    expect(parseDay("2027-03-14")?.toISOString()).toBe("2027-03-14T00:00:00.000Z");
    for (const bad of ["2027-02-30", "2027-13-01", "03/14/2027", "", null, undefined, "2027-3-14"]) expect(parseDay(bad)).toBeNull();
  });
});

describe("endDateProblem", () => {
  it("accepts a future date within 5 years", () => {
    expect(endDateProblem(parseDay("2027-03-14"), now)).toBeNull();
  });
  it("explains past, today, far-off and missing dates in plain words", () => {
    expect(endDateProblem(parseDay("2026-11-16"), now)).toMatch(/already passed/);
    expect(endDateProblem(parseDay("2020-01-01"), now)).toMatch(/already passed/);
    expect(endDateProblem(parseDay("2035-01-01"), now)).toMatch(/more than 5 years/);
    expect(endDateProblem(null, now)).toMatch(/doesn't look like a date/);
  });
});

describe("reminderIcs", () => {
  const ics = reminderIcs({ end: parseDay("2027-03-14")!, now, planName: "Simple Saver 3" });
  it("is a valid-looking calendar with one all-day event 30 days before the end", () => {
    expect(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain("DTSTART;VALUE=DATE:20270212");
    expect(ics).toContain("DTEND;VALUE=DATE:20270213");
    expect(ics).toContain("DTSTAMP:20261116T080000Z");
    expect(ics).toContain("TRIGGER:PT9H");
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
  });
  it("escapes commas and folds long lines at 75 octets with CRLF + space", () => {
    const unfolded = ics.replace(/\r\n /g, "");
    expect(unfolded).toContain("SUMMARY:Shop for a new power plan — yours ends March 14\\, 2027");
    expect(unfolded).toContain("(Simple Saver 3) ends on March 14\\, 2027");
    for (const line of ics.split("\r\n")) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    expect(ics).not.toMatch(/[^\r]\n/);
  });
  it("a contract ending in under 30 days gets a reminder tomorrow, not in the past", () => {
    const soon = reminderIcs({ end: parseDay("2026-11-30")!, now });
    expect(soon).toContain("DTSTART;VALUE=DATE:20261117");
  });
});
