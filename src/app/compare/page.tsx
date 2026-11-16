import type { Metadata } from "next";
import { langPair } from "@/lib/alternates";
import Link from "next/link";
import { compareYear } from "@/lib/compare";
import { PrintButton } from "@/components/PrintButton";
import { COMPARE_WORDS } from "@/lib/compareWords";
import { type Lang, MONTHS_BY_LANG, asLang } from "@/lib/i18n";
import { monthsFromParam } from "@/lib/months";
import { billQs, parseWallParams, readKwh } from "@/lib/params";
import { areaOf, planById } from "@/lib/plans/data";
import { AREAS } from "@/lib/plans/ptc";
import type { PlanRecord } from "@/lib/plans/schema";
import { whyLine, yearFor } from "@/lib/rank";

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export async function generateMetadata({ searchParams }: PageProps<"/compare">): Promise<Metadata> {
  const sp = await searchParams;
  const t = COMPARE_WORDS[asLang(one(sp.lang))];
  return { title: t.title, description: t.desc, alternates: langPair("/compare", sp) };
}
/** Reads ?a= &b= &kwh= from the URL, so it renders per request. */
export const instant = false;

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const tidy = (s: string) => s.replace(/\b(LLC|INC|LP|L\.P\.|CO)\b\.?/gi, "").replace(/\(TX\)/gi, "").replace(/\s+/g, " ").trim();

export default async function Compare({ searchParams }: PageProps<"/compare">) {
  const sp = await searchParams;
  const a = planById(one(sp.a) ?? ""), b = planById(one(sp.b) ?? "");
  const { kwh } = readKwh(one(sp.kwh));
  const seasons = one(sp.flat) !== "1";
  const mine = monthsFromParam(one(sp.m));
  const area = areaOf(a?.meta.id ?? "") ?? "houston";
  const months = mine ?? yearFor(kwh, seasons, area);
  const withConditional = one(sp.noauto) !== "1";
  const { filters, lang } = parseWallParams((k) => one(sp[k]));
  const t = COMPARE_WORDS[lang];
  const M = MONTHS_BY_LANG[lang];
  const qs = billQs({ kwh, seasons, months: mine, withConditional, area, filters, lang });

  if (!a?.pricing || !b?.pricing) {
    return (
      <div lang={lang} className="mx-auto max-w-3xl px-5 pt-10">
        <h1 className="display text-3xl font-extrabold">{t.pickTitle}</h1>
        <p className="mt-2 text-ink-2">{t.pickBody}</p>
        <Link href={`/wall?${qs}`} className="mt-5 inline-block rounded-full bg-ink px-5 py-2.5 font-bold text-paper">{t.back}</Link>
      </div>
    );
  }
  const areaB = areaOf(b.meta.id) ?? "houston";
  if (areaB !== area) {
    // different delivery utilities: one home can't be on both, and the delivery charges differ — don't mix them
    const where = (x: typeof area) => `${AREAS[x].city} (${AREAS[x].utility})`;
    return (
      <div lang={lang} className="mx-auto max-w-3xl px-5 pt-10">
        <h1 className="display text-3xl font-extrabold">{t.areasTitle}</h1>
        <p className="mt-2 text-ink-2">{t.areasBody(a.meta.planName, where(area), b.meta.planName, where(areaB))}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {[area, areaB].map((x) => (
            <Link key={x} href={`/wall?${billQs({ kwh, seasons, months: mine, withConditional, area: x, filters, lang })}`} className="rounded-full bg-ink px-5 py-2.5 font-bold text-paper">
              {t.areaPlans(AREAS[x].city)}
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
    <div lang={lang} className="mx-auto max-w-4xl px-5 pt-6">
      <div className="no-print flex items-center justify-between gap-3"><Link href={`/wall?${qs}`} className="text-sm font-medium text-ink-2 hover:text-ink">{t.all}</Link><PrintButton lang={lang} /></div>
      <h1 className="display mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">{t.h1}</h1>
      <p className="mt-1 text-ink-2">
        {mine ? t.mine : t.avg(kwh.toLocaleString("en-US"), AREAS[area].city, seasons)}. {t.today}
      </p>

      <section className="mt-5 rounded-3xl bg-ink p-5 text-paper shadow-[var(--shadow-lift)] sm:p-6">
        <p className="display text-2xl font-extrabold leading-tight sm:text-3xl">
          {cheaper
            ? <><span className="text-volt">{cheaper.meta.planName}</span> {t.saves} <span className="num text-volt">{money(Math.abs(c.diff))}</span> {t.aYear}</>
            : t.same}
        </p>
        <p className="mt-2 text-paper/80">{t.wins(a.meta.planName, c.winsA, b.meta.planName, c.winsB)}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Side rec={a} total={c.totalA} tone="a" months={months} qs={qs} cliffs={c.cliffsA} lang={lang} />
          <Side rec={b} total={c.totalB} tone="b" months={months} qs={qs} cliffs={c.cliffsB} lang={lang} />
        </div>
      </section>

      <section className="mt-4 rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
        <h2 className="text-lg font-bold">{t.monthly}</h2>
        <p className="text-sm text-ink-2"><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-ink align-middle" />{a.meta.planName} <span className="ml-3 mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-volt align-middle" />{b.meta.planName}</p>
        <div className="mt-4 flex h-44 items-end gap-1.5 max-[359px]:gap-0.5 sm:gap-3" role="img" aria-label={t.chart(c.rows.map((r, i) => `${M[i]} ${money(r.a)} ${t.vs} ${money(r.b)}`).join("; "))}>
          {c.rows.map((r, i) => (
            <div key={i} className="flex h-full min-w-0 flex-1 flex-col justify-end">
              <div className="flex h-full items-end gap-px sm:gap-0.5">
                <div className="flex-1 rounded-t bg-ink" style={{ height: `${(r.a / max) * 100}%` }} title={`${M[i]}: ${money(r.a)}`} />
                <div className="flex-1 rounded-t bg-volt" style={{ height: `${(r.b / max) * 100}%` }} title={`${M[i]}: ${money(r.b)}`} />
              </div>
              <p className="mt-1 text-center text-[0.625rem] tracking-tight text-ink-2 max-[359px]:text-[0.5625rem] sm:text-xs sm:tracking-normal">{M[i]}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 overflow-x-auto" role="region" aria-label={t.tableName}>{/* fits without scrolling from 320px up, so it's not a Tab stop */}
          <table className="num w-full min-w-[15rem] text-sm max-[359px]:text-xs">
            <thead className="font-sans text-ink-2"><tr><th className="py-1 pl-2 text-left align-bottom font-medium">{t.month}</th><th className="py-1 pl-2 text-right align-bottom font-medium">kWh</th><th className="py-1 pl-2 text-right align-bottom font-medium leading-tight">{a.meta.planName}</th><th className="py-1 pl-2 pr-2 text-right align-bottom font-medium leading-tight">{b.meta.planName}</th></tr></thead>
            <tbody>
              {c.rows.map((r, i) => (
                <tr key={i} className={i % 2 ? "" : "bg-paper"}>
                  <td className="py-1 pl-2 font-sans">{M[i]}</td><td className="pl-2 text-right">{r.kwh.toLocaleString("en-US")}</td>
                  <td className={`pl-2 text-right ${r.cheaper === "a" ? "font-bold text-good" : ""}`}>${r.a.toFixed(2)}</td>
                  <td className={`pl-2 pr-2 text-right ${r.cheaper === "b" ? "font-bold text-good" : ""}`}>${r.b.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Side({ rec, total, tone, months, qs, cliffs, lang }: { rec: PlanRecord; total: number; tone: "a" | "b"; months: number[]; qs: string; cliffs: { kwh: number; below: number; at: number }[]; lang: Lang }) {
  const t = COMPARE_WORDS[lang];
  const p = rec.pricing!;
  const why = whyLine(p, months, lang);
  return (
    <div className={`rounded-3xl p-4 sm:p-5 ${tone === "a" ? "bg-paper/10" : "bg-volt text-ink"}`}>
      <p className="text-lg font-bold leading-tight">{rec.meta.planName}</p>
      <p className="text-sm opacity-75">{tidy(rec.meta.provider)} · {t.months(p.termMonths)} · {rec.check.status === "verified" ? t.checks : t.notVerified}</p>
      <p className="num mt-3 text-3xl font-semibold">{money(total)}<span className="text-sm opacity-70">{t.perYr}</span></p>
      {why && <p className="mt-2 text-sm font-medium">{why}</p>}
      <p className="mt-2 text-sm opacity-80">
        {cliffs.length ? t.cliffs(cliffs.length, cliffs.map((x) => t.cliff(x.kwh.toLocaleString("en-US"), Math.abs(x.below - x.at).toFixed(0))).join(", ")) : t.noCliffs}
        {p.earlyTerminationFee.dollars ? t.exit(p.earlyTerminationFee.dollars, p.earlyTerminationFee.perMonthRemaining) : ""}
      </p>
      <Link href={`/plan/${rec.meta.id}?${qs}`} className="mt-3 inline-block text-sm font-semibold underline underline-offset-4">{t.finePrint}</Link>
    </div>
  );
}
