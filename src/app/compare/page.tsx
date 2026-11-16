import type { Metadata } from "next";
import Link from "next/link";
import { compareYear } from "@/lib/compare";
import { monthsFromParam } from "@/lib/months";
import { billQs, parseWallParams, readKwh } from "@/lib/params";
import { areaOf, planById } from "@/lib/plans/data";
import { AREAS } from "@/lib/plans/ptc";
import type { PlanRecord } from "@/lib/plans/schema";
import { whyLine, yearFor } from "@/lib/rank";
import { MONTHS } from "@/lib/seasons";

export const metadata: Metadata = { title: "Wattch — compare two plans" };
/** Reads ?a= &b= &kwh= from the URL, so it renders per request. */
export const instant = false;

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const tidy = (s: string) => s.replace(/\b(LLC|INC|LP|L\.P\.|CO)\b\.?/gi, "").replace(/\(TX\)/gi, "").replace(/\s+/g, " ").trim();

export default async function Compare({ searchParams }: PageProps<"/compare">) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const a = planById(one(sp.a) ?? ""), b = planById(one(sp.b) ?? "");
  const { kwh } = readKwh(one(sp.kwh));
  const seasons = one(sp.flat) !== "1";
  const mine = monthsFromParam(one(sp.m));
  const area = areaOf(a?.meta.id ?? "") ?? "houston";
  const months = mine ?? yearFor(kwh, seasons, area);
  const withConditional = one(sp.noauto) !== "1";
  const { filters, lang } = parseWallParams((k) => one(sp[k]));
  const qs = billQs({ kwh, seasons, months: mine, withConditional, area, filters, lang });

  if (!a?.pricing || !b?.pricing) {
    return (
      <div className="mx-auto max-w-3xl px-5 pt-10">
        <h1 className="display text-3xl font-extrabold">Pick two plans to compare</h1>
        <p className="mt-2 text-ink-2">One of these plans isn&apos;t in Wattch&apos;s list, or its fine print couldn&apos;t be read. Pick plans from the ranking.</p>
        <Link href={`/wall?${qs}`} className="mt-5 inline-block rounded-full bg-ink px-5 py-2.5 font-bold text-paper">Back to all plans</Link>
      </div>
    );
  }
  const areaB = areaOf(b.meta.id) ?? "houston";
  if (areaB !== area) {
    // different delivery utilities: one home can't be on both, and the delivery charges differ — don't mix them
    return (
      <div className="mx-auto max-w-3xl px-5 pt-10">
        <h1 className="display text-3xl font-extrabold">These plans are in different areas</h1>
        <p className="mt-2 text-ink-2">
          {a.meta.planName} is for {AREAS[area].city} ({AREAS[area].utility}) homes and {b.meta.planName} is for {AREAS[areaB].city} ({AREAS[areaB].utility}) homes.
          A home can only pick plans from its own area, so pick two plans from the same list.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {[area, areaB].map((x) => (
            <Link key={x} href={`/wall?${billQs({ kwh, seasons, months: mine, withConditional, area: x, filters, lang })}`} className="rounded-full bg-ink px-5 py-2.5 font-bold text-paper">
              {AREAS[x].city} plans
            </Link>
          ))}
        </div>
      </div>
    );
  }
  const c = compareYear(a.pricing, b.pricing, months, { includeConditional: withConditional });
  const max = Math.max(...c.rows.flatMap((r) => [r.a, r.b]), 1);
  const cheaper = c.diff > 0 ? a : c.diff < 0 ? b : null;
  return (
    <div className="mx-auto max-w-4xl px-5 pt-6">
      <Link href={`/wall?${qs}`} className="text-sm font-medium text-ink-2 hover:text-ink">← All plans</Link>
      <h1 className="display mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">Side by side</h1>
      <p className="mt-1 text-ink-2">
        {mine ? "Your own 12 months" : `${kwh.toLocaleString()} kWh a month on average${seasons ? `, with ${AREAS[area].city} seasons` : ", same every month"}`}. Today&apos;s prices, before taxes.
      </p>

      <section className="mt-5 rounded-3xl bg-ink p-5 text-paper shadow-[var(--shadow-lift)] sm:p-6">
        <p className="display text-2xl font-extrabold leading-tight sm:text-3xl">
          {cheaper
            ? <><span className="text-volt">{cheaper.meta.planName}</span> saves you <span className="num text-volt">{money(Math.abs(c.diff))}</span> a year.</>
            : "These two cost the same over your year."}
        </p>
        <p className="mt-2 text-paper/80">
          {a.meta.planName} is cheaper in <b className="num">{c.winsA}</b> month{c.winsA === 1 ? "" : "s"}, {b.meta.planName} in <b className="num">{c.winsB}</b>.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Side rec={a} total={c.totalA} tone="a" months={months} qs={qs} cliffs={c.cliffsA} />
          <Side rec={b} total={c.totalB} tone="b" months={months} qs={qs} cliffs={c.cliffsB} />
        </div>
      </section>

      <section className="mt-4 rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
        <h2 className="text-lg font-bold">Each month&apos;s bill</h2>
        <p className="text-sm text-ink-2"><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-ink align-middle" />{a.meta.planName} <span className="ml-3 mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-volt align-middle" />{b.meta.planName}</p>
        <div className="mt-4 flex h-44 items-end gap-1.5 sm:gap-3" role="img" aria-label={`Monthly bills: ${c.rows.map((r, i) => `${MONTHS[i]} ${money(r.a)} vs ${money(r.b)}`).join("; ")}`}>
          {c.rows.map((r, i) => (
            <div key={i} className="flex h-full flex-1 flex-col justify-end">
              <div className="flex h-full items-end gap-px sm:gap-0.5">
                <div className="flex-1 rounded-t bg-ink" style={{ height: `${(r.a / max) * 100}%` }} title={`${MONTHS[i]}: ${money(r.a)}`} />
                <div className="flex-1 rounded-t bg-volt" style={{ height: `${(r.b / max) * 100}%` }} title={`${MONTHS[i]}: ${money(r.b)}`} />
              </div>
              <p className="mt-1 text-center text-[0.625rem] text-ink-2 sm:text-xs">{MONTHS[i]}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 overflow-x-auto" tabIndex={0} role="region" aria-label="Each month's bill, as a table">
          <table className="num w-full min-w-[28rem] text-sm">
            <thead className="font-sans text-ink-2"><tr><th className="py-1 text-left font-medium">Month</th><th className="text-right font-medium">kWh</th><th className="text-right font-medium">{a.meta.planName}</th><th className="text-right font-medium">{b.meta.planName}</th></tr></thead>
            <tbody>
              {c.rows.map((r, i) => (
                <tr key={i} className={i % 2 ? "" : "bg-paper"}>
                  <td className="py-1 pl-2 font-sans">{MONTHS[i]}</td><td className="text-right">{r.kwh.toLocaleString()}</td>
                  <td className={`text-right ${r.cheaper === "a" ? "font-bold text-good" : ""}`}>${r.a.toFixed(2)}</td>
                  <td className={`pr-2 text-right ${r.cheaper === "b" ? "font-bold text-good" : ""}`}>${r.b.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Side({ rec, total, tone, months, qs, cliffs }: { rec: PlanRecord; total: number; tone: "a" | "b"; months: number[]; qs: string; cliffs: { kwh: number; below: number; at: number }[] }) {
  const p = rec.pricing!;
  const why = whyLine(p, months);
  return (
    <div className={`rounded-3xl p-4 sm:p-5 ${tone === "a" ? "bg-paper/10" : "bg-volt text-ink"}`}>
      <p className="text-lg font-bold leading-tight">{rec.meta.planName}</p>
      <p className="text-sm opacity-75">{tidy(rec.meta.provider)} · {p.termMonths} months · {rec.check.status === "verified" ? "✓ label checks out" : "not verified"}</p>
      <p className="num mt-3 text-3xl font-semibold">{money(total)}<span className="text-sm opacity-70">/yr</span></p>
      {why && <p className="mt-2 text-sm font-medium">{why}</p>}
      <p className="mt-2 text-sm opacity-80">
        {cliffs.length
          ? `Price cliff${cliffs.length > 1 ? "s" : ""}: ${cliffs.map((x) => `${x.kwh.toLocaleString()} kWh (bill jumps $${Math.abs(x.below - x.at).toFixed(0)})`).join(", ")}.`
          : "No price cliffs between 100 and 3,000 kWh."}
        {p.earlyTerminationFee.dollars ? ` Exit fee $${p.earlyTerminationFee.dollars}${p.earlyTerminationFee.perMonthRemaining ? " × months left" : ""}.` : ""}
      </p>
      <Link href={`/plan/${rec.meta.id}?${qs}`} className={`mt-3 inline-block text-sm font-semibold underline underline-offset-4`}>Read its fine print</Link>
    </div>
  );
}
