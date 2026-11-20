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
export const PROBLEMS = {
  en: {
    bad: "That doesn't look like a date. Pick the day your contract ends.",
    past: "That day has already passed. If your contract already ended, you can shop for a new plan today.",
    far: "That's more than 5 years away. Check the end date on your contract or your last bill.",
  },
  es: {
    bad: "Eso no parece una fecha. Escoge el día en que termina tu contrato.",
    past: "Ese día ya pasó. Si tu contrato ya terminó, puedes buscar un plan nuevo hoy.",
    far: "Eso es en más de 5 años. Revisa la fecha de fin en tu contrato o en tu última factura.",
  },
} as const;

export function endDateProblem(end: Date | null, now: Date, lang: "en" | "es" = "en"): string | null {
  const P = PROBLEMS[lang];
  if (!end) return P.bad;
  const today = parseDay(now.toISOString().slice(0, 10))!;
  if (end.getTime() <= today.getTime()) return P.past;
  if (end.getTime() > addDays(today, 366 * 5).getTime()) return P.far;
  return null;
}

/** The reminder's day: 30 days before the end, or tomorrow if that's already past. */
export function reminderDay(end: Date, now: Date): Date {
  const remind = addDays(end, -REMIND_DAYS);
  const today = parseDay(now.toISOString().slice(0, 10))!;
  return remind.getTime() > today.getTime() ? remind : addDays(today, 1);
}

export const ICS_WORDS = {
  en: {
    summary: (end: string) => `Shop for a new power plan — yours ends ${end}`,
    desc: (plan: string, end: string, url: string) => `Your power plan${plan} ends on ${end}. If you don't pick a new plan, you may be moved to a month-to-month rate that can cost more. Compare every plan's real price: ${url}`,
    alarm: "Your power plan ends soon. Compare plans on Wattch.",
  },
  es: {
    summary: (end: string) => `Busca un nuevo plan de luz — el tuyo termina el ${end}`,
    desc: (plan: string, end: string, url: string) => `Tu plan de luz${plan} termina el ${end}. Si no escoges un plan nuevo, te pueden pasar a una tarifa mes a mes que puede costar más. Compara el precio real de cada plan: ${url}`,
    alarm: "Tu plan de luz termina pronto. Compara planes en Wattch.",
  },
} as const;

/** "March 14, 2027" / "14 de marzo de 2027" */
export const dayText = (d: Date, lang: "en" | "es" = "en", year = true) =>
  d.toLocaleDateString(lang === "es" ? "es-US" : "en-US", { month: "long", day: "numeric", ...(year ? { year: "numeric" } : {}), timeZone: "UTC" });

export function reminderIcs(o: { end: Date; now: Date; planName?: string; url?: string; lang?: "en" | "es" }): string {
  const lang = o.lang ?? "en";
  const W = ICS_WORDS[lang];
  const day = reminderDay(o.end, o.now);
  const endText = dayText(o.end, lang);
  const plan = o.planName ? ` (${o.planName})` : "";
  const url = o.url ?? "https://getwattch.vercel.app";
  const desc = W.desc(plan, endText, url);
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
    `SUMMARY:${esc(W.summary(endText))}`,
    `DESCRIPTION:${esc(desc)}`,
    `URL:${url}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(W.alarm)}`,
    "TRIGGER:PT9H",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}
