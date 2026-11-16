/**
 * A calendar reminder (.ics) to shop for a new power plan before your contract ends.
 * One all-day event 30 days before the end date (or tomorrow, if that's already past), with a pop-up at 9 AM that day.
 */
export const REMIND_DAYS = 30;

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
const stamp = (d: Date) => `${ymd(d)}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
/** RFC 5545 text: escape backslash, semicolon, comma and newlines. */
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
/** RFC 5545 lines are at most 75 octets; continue with a leading space. */
function fold(line: string): string {
  const out: string[] = [];
  let cur = "";
  for (const ch of line) {
    if (new TextEncoder().encode(cur + ch).length > 75) { out.push(cur); cur = " " + ch; } else cur += ch;
  }
  out.push(cur);
  return out.join("\r\n");
}

/** "2027-03-14" → a Date at UTC midnight, or null if it isn't a real calendar date. */
export function parseDay(s: string | null | undefined): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s ?? "");
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return d.getUTCFullYear() === Number(m[1]) && d.getUTCMonth() === Number(m[2]) - 1 && d.getUTCDate() === Number(m[3]) ? d : null;
}

const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

/** Why a date can't be used, in plain words — or null when it's fine. */
export function endDateProblem(end: Date | null, now: Date): string | null {
  if (!end) return "That doesn't look like a date. Pick the day your contract ends.";
  const today = parseDay(now.toISOString().slice(0, 10))!;
  if (end.getTime() <= today.getTime()) return "That day has already passed. If your contract already ended, you can shop for a new plan today.";
  if (end.getTime() > addDays(today, 366 * 5).getTime()) return "That's more than 5 years away. Check the end date on your contract or your last bill.";
  return null;
}

/** The reminder's day: 30 days before the end, or tomorrow if that's already past. */
export function reminderDay(end: Date, now: Date): Date {
  const remind = addDays(end, -REMIND_DAYS);
  const today = parseDay(now.toISOString().slice(0, 10))!;
  return remind.getTime() > today.getTime() ? remind : addDays(today, 1);
}

export function reminderIcs(o: { end: Date; now: Date; planName?: string; url?: string }): string {
  const day = reminderDay(o.end, o.now);
  const endText = o.end.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
  const plan = o.planName ? ` (${o.planName})` : "";
  const url = o.url ?? "https://getwattch.vercel.app";
  const desc = `Your power plan${plan} ends on ${endText}. If you don't pick a new plan, you may be moved to a month-to-month rate that can cost more. Compare every plan's real price: ${url}`;
  const uid = `wattch-${ymd(o.end)}-${ymd(day)}@getwattch.vercel.app`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wattch//Renewal reminder//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp(o.now)}`,
    `DTSTART;VALUE=DATE:${ymd(day)}`,
    `DTEND;VALUE=DATE:${ymd(addDays(day, 1))}`,
    `SUMMARY:${esc(`Shop for a new power plan — yours ends ${endText}`)}`,
    `DESCRIPTION:${esc(desc)}`,
    `URL:${url}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc("Your power plan ends soon. Compare plans on Wattch.")}`,
    "TRIGGER:PT9H",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}
