import type { Metadata } from "next";
import { cardUrl, langPair, shareMeta } from "@/lib/alternates";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CliffChart } from "@/components/CliffChart";
import { Fresh } from "@/components/Fresh";
import { HighlightScope, HoverKey, LabelText } from "@/components/Highlight";
import { LiveCheck } from "@/components/LiveCheck";
import { PrintButton } from "@/components/PrintButton";
import { YearBars } from "@/components/YearBars";
import { annualCost, billLines, monthlyBill } from "@/lib/bill";
import { explainBill } from "@/lib/bill/explain";
import { asLang } from "@/lib/i18n";
import { PLAN_WORDS, lineLabel } from "@/lib/planWords";
import { questions } from "@/lib/questions";
import { whyLine, yearFor } from "@/lib/rank";
import { belongs, labelSegments } from "@/lib/finePrint";
import { monthsFromParam } from "@/lib/months";
import { billQs, parseWallParams, readKwh } from "@/lib/params";
import { areaOf, labelText, planById } from "@/lib/plans/data";
import { AREAS } from "@/lib/plans/ptc";
import { shortProvider as tidyName } from "@/lib/names";

/** Reads ?kwh= from the URL, so it renders per request. */
export const instant = false;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export async function generateMetadata({ params, searchParams }: PageProps<"/plan/[id]">): Promise<Metadata> {
  const { id } = await params;
  const sp = await searchParams;
  const rec = planById(id);
  const es = asLang(one(sp.lang)) === "es";
  if (!rec) return { title: es ? "Wattch — plan no encontrado" : "Wattch — plan not found" };
  const who = tidyName(rec.meta.provider);
  const area = areaOf(rec.meta.id) ?? "houston";
  const city = AREAS[area].city;
  const yr = rec.pricing ? Math.round(annualCost(rec.pricing, yearFor(1100, true, area))).toLocaleString("en-US") : "";
  const description = rec.pricing
    ? es
      ? `${rec.meta.planName} (${who}) se anuncia a ${rec.meta.ptc.k1000}¢. Con 1,100 kWh al mes durante un año en ${city}, en realidad cuesta $${yr} al año.`
      : `${rec.meta.planName} (${who}) is advertised at ${rec.meta.ptc.k1000}¢. At 1,100 kWh a month through a ${city} year it really costs $${yr} a year.`
    : es ? `${rec.meta.planName} de ${who}: la letra pequeña, leída y revisada.` : `${rec.meta.planName} from ${who}: the fine print, read and checked.`;
  return { title: `${rec.meta.planName} — ${es ? "la letra pequeña, revisada" : "the fine print, checked"} · Wattch`, description, alternates: langPair(`/plan/${id}`, sp), ...shareMeta(`${cardUrl(sp, { area })}&plan=${encodeURIComponent(id)}`) };
}

export default async function PlanPage({ params, searchParams }: PageProps<"/plan/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const rec = planById(id);
  if (!rec) notFound();
  const { kwh } = readKwh(one(sp.kwh));
  const seasons = one(sp.flat) !== "1";
  const p = rec.pricing;
  const mine = monthsFromParam(one(sp.m));
  const area = areaOf(id) ?? "houston";
  if (area !== "houston" && one(sp.area) !== area) {
    // a bare link to a Dallas plan: add ?area= so the header, the back link and every other link agree on the area
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (typeof v === "string") q.set(k, v);
    q.set("area", area);
    redirect(`/plan/${id}?${q.toString()}`);
  }
  const { city, utility } = AREAS[area];
  const { filters, lang } = parseWallParams((k) => one(sp[k]));
  const es = lang === "es";
  const t = PLAN_WORDS[lang];
  const months = mine ?? yearFor(kwh, seasons, area);
  const asks = p ? questions(p, months, 4, lang) : [];
  const withConditional = one(sp.noauto) !== "1";
  const opts = { includeConditional: withConditional };
  const whyAll = p ? explainBill(p, kwh, { ...opts, utility, lang }) : [];
  const lineWhy = new Map(whyAll.map((w) => [w.key, w.text]));
  const missed = whyAll.filter((w) => w.key.startsWith("missed-"));
  const year = p ? annualCost(p, months, opts) : 0;
  const why = p ? whyLine(p, months, lang) : null;
  const line = p?.credits.filter((c) => !c.conditional && c.minKwh > 0).sort((a, b) => b.dollars - a.dollars)[0]?.minKwh;
  const back = billQs({ kwh, seasons, months: mine, withConditional, area, filters, lang });
  const text = p ? labelText(id) : null;
  const fp = p && text ? labelSegments(text, p, { tduFilled: rec.check.tduFilled }) : null;
  const marks = fp ? fp.segments.filter((x) => x.key).length : 0;
  const found = (key: string) => !!fp && Object.entries(fp.found).some(([k, n]) => n > 0 && belongs(k, key));
  const read = new Date(rec.read.fetchedAt).toLocaleString(es ? "es-US" : "en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" });
  const k = (n: number) => n.toLocaleString("en-US");
  return (
    <HighlightScope es={es}>
    <div lang={lang} className="mx-auto max-w-4xl px-5 pt-6">
      <div className="no-print flex items-center justify-between gap-3"><Link href={`/wall?${back}`} className="text-sm font-medium text-ink-2 hover:text-ink">{t.all}</Link><PrintButton lang={lang} /></div>
      <h1 className="display mt-3 text-4xl font-extrabold leading-tight">{rec.meta.planName}</h1>
      <p className="mt-1 text-ink-2">{rec.meta.provider} · {es ? ({ Fixed: "Precio fijo", Variable: "Precio variable" } as Record<string, string>)[rec.meta.rateType] ?? rec.meta.rateType : rec.meta.rateType} · {p ? t.months(p.termMonths) : ""} · {t.renewable(rec.meta.renewablePct)}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-[1.2fr_1fr]">
        <section className="rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
          <h2 className="text-lg font-bold">{t.checkTitle}</h2>
          {rec.check.rows.length ? (
            <table className="mt-3 w-full text-left">
              <thead className="text-sm text-ink-2"><tr><th className="py-1 font-medium">{t.usage}</th><th className="font-medium">{t.says}</th><th className="font-medium">{t.ours}</th><th><span className="sr-only">{t.match}</span></th></tr></thead>
              <tbody className="num">
                {rec.check.rows.map((r) => (
                  <HoverKey as="tr" k={`avg-${r.kwh}`} found={found(`avg-${r.kwh}`)} key={r.kwh}>
                    <td className="py-1 pl-1">{k(r.kwh)} kWh</td><td>{r.printed.toFixed(1)}¢</td><td>{r.ours.toFixed(1)}¢</td>
                    <td className={r.ok ? "text-good" : "text-over"}>{r.ok ? "✓" : "✕"}</td>
                  </HoverKey>
                ))}
              </tbody>
            </table>
          ) : null}
          <p className={`mt-3 rounded-2xl px-3 py-2 text-sm font-medium ${rec.check.status === "verified" ? "bg-good-2" : "bg-volt-2"}`}>
            {rec.check.status === "verified" ? t.verified : t.notVerified(rec.check.message)}
          </p>
          {rec.check.status === "verified" && (rec.check.tduFilled || !rec.read.parsedBy.startsWith("claude")) && (
            <p className="mt-2 text-sm text-ink-2" lang="en">{rec.check.message}</p>
          )}
          <div className="no-print"><LiveCheck id={id} lang={lang} /></div>
          <p className="mt-3 text-xs text-ink-2">
            {t.fetched(read)}{/* "3 hours ago" is wrong on paper, so print shows the date only */}<span className="no-print"> (<Fresh at={rec.read.fetchedAt} prefix="" lang={lang} />)</span> {rec.read.via === "anakin" ? t.viaAnakin : t.viaDirect} ·{" "}
            {t.readBy(rec.read.parsedBy)}.{" "}
            <a className="underline" href={rec.meta.eflUrl} target="_blank" rel="noreferrer">{t.original}</a>
          </p>
        </section>
        {p && (
          <section className="rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
            <h2 className="text-lg font-bold">{t.billAt} <span className="num">{k(kwh)}</span> kWh</h2>
            <ul className="num mt-3 space-y-1 text-sm">
              {billLines(p, kwh, opts).map((l, i) => (
                <HoverKey key={i} k={l.key} found={found(l.key)} className="-mx-1.5 block px-1.5 py-0.5">
                  <span className="flex justify-between gap-3">
                    <span className="font-sans" lang={es && lineLabel(l, lang) === l.label && !/^(energy|base|tdu)/.test(l.key) ? "en" : undefined}>{lineLabel(l, lang)}{found(l.key) ? <span aria-hidden className="ml-1.5 inline-block h-1.5 w-1.5 -translate-y-0.5 rounded-full bg-volt" /> : null}</span>
                    <span className={`whitespace-nowrap ${l.dollars < 0 ? "text-good" : ""}`}>{l.dollars < 0 ? "−" : ""}${Math.abs(l.dollars).toFixed(2)}</span>
                  </span>
                  {lineWhy.get(l.key) && <span className="mt-0.5 block font-sans text-xs leading-snug text-ink-2">{lineWhy.get(l.key)}</span>}
                </HoverKey>
              ))}
              <li className="mt-2 flex justify-between rounded-xl bg-paper px-2 py-1.5 text-base font-semibold"><span className="font-sans">{t.total}</span><span>${monthlyBill(p, kwh, opts).toFixed(2)}</span></li>
            </ul>
            {missed.map((m) => <p key={m.key} className="mt-2 rounded-xl bg-over-2 px-3 py-2 text-sm font-medium">{m.text}</p>)}
          </section>
        )}
      </div>

      {fp && text && (
        <section className="no-print mt-4 rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold">{t.fpTitle}</h2>
            <p className="text-sm text-ink-2"><span className="num">{marks}</span> {t.fpFound}</p>
          </div>
          <p className="mt-1 text-sm text-ink-2">
            <mark className="rounded bg-volt-2 px-1 text-ink">{t.yellow}</mark> {t.yellowIs}{" "}
            <mark className="rounded bg-good-2 px-1 text-ink">{t.green}</mark> {t.greenIs}{" "}
            {t.hoverHint}
          </p>
          {t.langNote && <p className="mt-1 text-sm text-ink-2">{t.langNote}</p>}
          {rec.check.tduFilled && <p className="mt-1 text-sm text-ink-2">{t.tduFilled(utility)}</p>}
          {marks < 3 && <p className="mt-1 text-sm text-ink-2">{t.formFields}</p>}
          <div className="mt-3"><LabelText segments={fp.segments} /></div>
          <p className="mt-2 text-xs text-ink-2">{t.exact(rec.read.via === "anakin")}</p>
        </section>
      )}

      {p && (
        <section className="print-plain mt-4 rounded-3xl bg-ink p-5 text-paper shadow-[var(--shadow-lift)] sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-lg font-bold">{t.yearTitle}</h2>
            <p className="num text-3xl font-semibold text-volt">${Math.round(year).toLocaleString("en-US")}<span className="text-sm text-paper/70">{t.perYr}</span></p>
          </div>
          <p className="mt-1 text-sm text-paper/70">
            {mine ? t.mine : seasons ? t.shaped(k(kwh), city, area === "dallas") : t.flat(k(kwh))}{" "}
            <Link className="no-print underline underline-offset-4" href={`/plan/${id}?${billQs({ kwh, seasons: !seasons, withConditional, area, filters, lang })}`}>{seasons ? t.toFlat : t.toSeasons(city)}</Link>
          </p>
          {why && <p className="mt-3 text-lg font-semibold"><span className="text-volt">{t.why}</span> {why}</p>}
          <div className="no-print mt-4"><YearBars months={months} line={line} lineLabel={line ? t.creditNeeds(k(line)) : undefined} dark lang={lang} /></div>
        </section>
      )}

      {asks.length > 0 && (
        <section className="mt-4 rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
          <h2 className="text-lg font-bold">{t.askTitle}</h2>
          <ol className="mt-3 space-y-3">
            {asks.map((a, i) => (
              <li key={a.key} className="flex gap-3">
                <span className="num flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-volt-2 text-sm font-bold">{i + 1}</span>
                <div>
                  <p className="font-semibold">{a.q}</p>
                  <p className="text-sm text-ink-2">{a.why}{a.key === "short" && <> <Link href={`/remind?plan=${encodeURIComponent(rec.meta.planName)}${es ? "&lang=es" : ""}`} className="no-print font-medium underline underline-offset-4">{t.remind}</Link></>}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-ink-2">{t.askBy}</p>
        </section>
      )}

      {p && (
        <section className="no-print mt-4 rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
          <h2 className="text-lg font-bold">{t.curveTitle}</h2>
          <p className="text-sm text-ink-2">{t.curveHint}</p>
          <div className="mt-3"><CliffChart pricing={p} kwh={kwh} lang={lang} /></div>
        </section>
      )}

      {p && p.notes.length > 0 && (
        <section className="no-print mt-4 rounded-3xl bg-volt-2 p-5">
          <h2 className="text-lg font-bold">{t.notesTitle}</h2>
          <ul lang="en" className="mt-2 list-disc space-y-1 pl-5">{p.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
          <p className="mt-2 text-xs text-ink-2">{t.notesBy}</p>
        </section>
      )}
      <p className="mt-4 hidden text-xs print:block">
        {t.printed(id, read)} {t.originalLabel} {rec.meta.eflUrl}
      </p>
    </div>
    </HighlightScope>
  );
}
