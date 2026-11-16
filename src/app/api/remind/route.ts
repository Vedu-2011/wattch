import { asLang } from "@/lib/i18n";
import { endDateProblem, parseDay, reminderIcs } from "@/lib/ics";

/** GET /api/remind?end=YYYY-MM-DD[&plan=name][&lang=es] → a calendar file with a reminder 30 days before the contract ends. */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const lang = asLang(sp.get("lang"));
  const now = new Date();
  const end = parseDay(sp.get("end"));
  const problem = endDateProblem(end, now, lang);
  if (problem || !end) return new Response(problem ?? "Pick the day your contract ends.", { status: 400, headers: { "content-type": "text/plain; charset=utf-8" } });
  const planName = (sp.get("plan") ?? "").replace(/[^\p{L}\p{N} .,'&+()/-]/gu, "").slice(0, 80) || undefined;
  const ics = reminderIcs({ end, now, planName, url: `${new URL(req.url).origin}/`, lang });
  return new Response(ics, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": `attachment; filename="wattch-reminder-${sp.get("end")}.ics"`,
      "cache-control": "no-store",
    },
  });
}
