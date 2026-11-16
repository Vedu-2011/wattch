import type { Metadata } from "next";
import Link from "next/link";
import { Kapi } from "@/components/Kapi";
import { REMIND_DAYS, endDateProblem, parseDay, reminderDay } from "@/lib/ics";

export const metadata: Metadata = {
  title: "Wattch — remind me before my plan ends",
  description: "Add a reminder to your calendar 30 days before your power plan ends, so you can shop before your price changes.",
};
/** Reads ?end= from the URL, so it renders per request. */
export const instant = false;

export default async function Remind({ searchParams }: PageProps<"/remind">) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.end) ? sp.end[0] : sp.end;
  const plan = (Array.isArray(sp.plan) ? sp.plan[0] : sp.plan) ?? "";
  const end = parseDay(raw);
  const problem = raw ? endDateProblem(end, new Date()) : null;
  const ok = raw && end && !problem;
  const endText = end?.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
  const remindText = end && reminderDay(end, new Date()).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
  const file = `/api/remind?end=${raw ?? ""}${plan ? `&plan=${encodeURIComponent(plan)}` : ""}`;
  return (
    <div className="mx-auto max-w-2xl px-5 pt-8">
      <div className="flex items-end gap-3">
        <Kapi pose="thinking" className="h-16 w-16 shrink-0" />
        <h1 className="display text-3xl font-extrabold leading-tight sm:text-4xl">Don&apos;t let your plan run out on you.</h1>
      </div>
      <p className="mt-4 text-lg text-ink-2">
        When a fixed-price plan ends and you don&apos;t pick a new one, you may be moved to a month-to-month rate that can cost more.
        Tell Wattch when yours ends and get a reminder in your calendar {REMIND_DAYS} days before.
      </p>

      <form action="/remind" method="get" className="mt-6 rounded-3xl bg-card p-5 shadow-[var(--shadow-lift)] sm:p-6">
        <label htmlFor="end" className="block text-base font-semibold">When does your contract end?</label>
        <p className="mt-1 text-sm text-ink-2">It&apos;s on your bill or your welcome letter, often called &ldquo;contract expiration.&rdquo;</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input id="end" name="end" type="date" required defaultValue={raw ?? ""}
            className="num min-w-0 flex-1 rounded-2xl bg-paper px-4 py-3 text-lg font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ink" />
          {plan && <input type="hidden" name="plan" value={plan} />}
          <button className="rounded-2xl bg-volt px-5 py-3 text-base font-bold text-ink shadow-[var(--shadow-soft)] hover:brightness-95">Make my reminder</button>
        </div>
        {problem && <p role="alert" className="mt-3 text-sm font-medium text-over">{problem}</p>}
      </form>

      {ok && (
        <section className="pop mt-6 rounded-3xl bg-ink p-5 text-paper shadow-[var(--shadow-lift)] sm:p-6">
          <p className="text-sm font-semibold text-volt">Your plan{plan ? ` (${plan})` : ""} ends {endText}</p>
          <p className="display mt-2 text-2xl font-extrabold leading-tight sm:text-3xl">Your reminder: {remindText}.</p>
          <p className="mt-2 text-paper/80">Open the file and your phone or computer adds it to your calendar. Nothing is saved on Wattch.</p>
          <a href={file} download className="mt-4 inline-block rounded-full bg-volt px-5 py-2.5 font-bold text-ink">Add to my calendar</a>
        </section>
      )}

      <p className="mt-6 text-sm text-ink-2">
        Want to see what you&apos;d pay on every plan right now? <Link href="/" className="font-semibold underline underline-offset-4">Start here</Link>.
      </p>
    </div>
  );
}
