"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Kapi } from "@/components/Kapi";
import { CurrentPlan } from "@/components/CurrentPlan";
import { JudgeQr } from "@/components/JudgeQr";
import { MyMonths } from "@/components/MyMonths";
import { average, monthsToParam } from "@/lib/months";
import { FILTER_KEYS, NO_FILTERS, type WallFilters, anyFilter, billQs, filterOpts as toOpts } from "@/lib/params";
import { CountUp } from "@/components/CountUp";
import { type Lang, TRAP_LABELS, type Words, words } from "@/lib/i18n";
import { AREAS, type Area } from "@/lib/plans/ptc";
import { ShareButton } from "@/components/ShareButton";
import { YearBars } from "@/components/YearBars";
import { type ClientPlan, type Ranked, passesFilters, ptcTopPick, rank, traps, whyLine, yearFor } from "@/lib/rank";

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const cents = (n: number) => `${n.toFixed(1)}¢`;
const short = (s: string) => s.replace(/\b(LLC|INC|LP|L\.P\.|CO)\b\.?/gi, "").replace(/\(TX\)/gi, "").replace(/\s+/g, " ").trim();
const title = (s: string) => short(s).toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * The wall replays real reads: faster reads finish first. Pace is by order (not raw time), so one very slow label
 * doesn't leave the wall sitting still — tiles land steadily across the whole replay.
 */
function useReveal(plans: ClientPlan[], totalMs = 9000) {
  const order = useMemo(() => {
    const sorted = [...plans].sort((a, b) => (a.readMs || 0) - (b.readMs || 0));
    const n = Math.max(sorted.length - 1, 1);
    return sorted.map((p, i) => ({ id: p.id, at: 400 + (i / n) ** 1.15 * (totalMs - 1200) }));
  }, [plans, totalMs]);
  const [now, setNow] = useState(0);
  const [skip, setSkip] = useState(false);
  useEffect(() => {
    if (skip) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    if (reduce) { raf = requestAnimationFrame(() => setNow(Infinity)); return () => cancelAnimationFrame(raf); }
    const t0 = performance.now();
    const tick = () => { const n = performance.now() - t0; setNow(n); if (n < totalMs + 200) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [skip, totalMs]);
  const readIds = new Set(order.filter((o) => skip || o.at <= now).map((o) => o.id));
  return { readIds, done: skip || now >= totalMs, skip: () => setSkip(true) };
}


export function Wall({ plans, kwh: initialKwh, builtAt, seasons: initialSeasons, months: initialMonths = null, filters: initialFilters = NO_FILTERS, withConditional: initialConditional = true, lang = "en", area = "houston", kwhNote = null }: { plans: ClientPlan[]; kwh: number; kwhNote?: "low" | "high" | "bad" | null; builtAt: string; seasons: boolean; months?: number[] | null; filters?: WallFilters; withConditional?: boolean; lang?: Lang; area?: Area }) {
  const w = words(lang, area);
  const { readIds, done, skip } = useReveal(plans);
  const [kwh, setKwh] = useState(initialKwh);
  const [seasons, setSeasons] = useState(initialSeasons);
  // your own 12 months, when you've typed them in; otherwise an average spread by Houston seasons
  const [mine, setMine] = useState<number[] | null>(initialMonths);
  const [withConditional, setWithConditional] = useState(initialConditional);
  const [f, setF] = useState<WallFilters>(initialFilters);
  // carried into every plan / compare link so those pages price bills the same way as this ranking (and keep the filters)
  const qs = billQs({ kwh, seasons, months: mine, withConditional, area, filters: f, lang });
  const filterOpts = useMemo(() => toOpts(f), [f]);
  const filtered = anyFilter(f);
  // keep the address bar shareable: usage, your months, and every filter
  useEffect(() => {
    const u = new URL(window.location.href);
    u.searchParams.set("kwh", String(kwh));
    if (mine) u.searchParams.set("m", monthsToParam(mine)); else u.searchParams.delete("m");
    if (seasons) u.searchParams.delete("flat"); else u.searchParams.set("flat", "1");
    if (withConditional) u.searchParams.delete("noauto"); else u.searchParams.set("noauto", "1");
    for (const key of Object.keys(FILTER_KEYS) as (keyof WallFilters)[]) {
      if (f[key]) u.searchParams.set(FILTER_KEYS[key], "1"); else u.searchParams.delete(FILTER_KEYS[key]);
    }
    window.history.replaceState(null, "", u);
  }, [kwh, mine, seasons, f, withConditional]);
  const verifiedRead = plans.filter((p) => readIds.has(p.id) && p.status === "verified").length;
  const ranked = useMemo(() => rank(plans, kwh, { includeConditional: withConditional, seasons, months: mine, area, ...filterOpts }), [plans, kwh, withConditional, seasons, mine, filterOpts, area]);
  // with the 12-month filter on, compare against the state site's #1 among those same plans
  const pick = useMemo(() => ptcTopPick(plans.filter((p) => p.pricing && passesFilters(p, filterOpts))), [plans, filterOpts]);
  const notRanked = plans.filter((p) => p.status === "verified" && !p.prepaid && p.rateType.toLowerCase() === "variable").length;
  const when = new Date(builtAt).toLocaleString(lang === "es" ? "es-US" : "en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  // when the last tile flips, bring the answer into view (the wall is long on a phone)
  const [arrived, setArrived] = useState(false);
  useEffect(() => {
    if (!done || arrived) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => { if (window.scrollY < 200) document.getElementById("answer")?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" }); setArrived(true); }, smooth ? 450 : 0);
    return () => clearTimeout(t);
  }, [done, arrived]);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-end gap-3">
          <Kapi pose={done ? "celebrating" : "reading"} className="h-14 w-14 shrink-0" />
          <div>
            <h1 className="display text-3xl font-extrabold sm:text-4xl">{done ? w.wallDone : w.wallReading}</h1>
            <p className="mt-1 max-w-2xl text-sm text-ink-2">{w.wallIntro(when)}</p>
            {kwhNote && <p role="status" className="mt-2 max-w-2xl rounded-2xl bg-volt-2 px-3 py-2 text-sm font-medium">{w.kwhNote(kwhNote, initialKwh)}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Counter label={w.counterRead} value={readIds.size} of={plans.length} />
          <Counter label={w.counterChecked} value={verifiedRead} tone="good" />
          {!done && <button onClick={skip} className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper">{w.skip}</button>}
        </div>
      </div>

      <Walker progress={readIds.size / Math.max(plans.length, 1)} done={done} />

      <div className="mt-4 grid grid-cols-10 gap-1 sm:grid-cols-8 sm:gap-2 lg:grid-cols-12">
        {plans.map((p) => <Tile key={p.id} p={p} read={readIds.has(p.id)} w={w} />)}
      </div>

      {done && (
        <section id="answer" className="pop mt-8 scroll-mt-4 space-y-6">
          {ranked.length > 0 ? (
            <Reveal kwh={kwh} seasons={seasons} ranked={ranked} pick={pick} locked={filtered} mine={!!mine} qs={qs} lang={lang} area={area} />
          ) : (
            <div className="flex items-center gap-4 rounded-3xl bg-over-2 p-5 shadow-[var(--shadow-soft)]">
              <Kapi pose="thinking" className="h-16 w-16 shrink-0" />
              <div>
                <p className="text-lg font-bold">{w.noneTitle}</p>
                <p className="mt-1 text-ink-2">{w.noneBody}</p>
              </div>
            </div>
          )}

          <div className="rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
            <label htmlFor="slide" className="block text-base font-semibold">
              {w.youAverage(kwh, !!mine)}
            </label>
            <input id="slide" type="range" min={200} max={3000} step={10} value={kwh} onChange={(e) => { setMine(null); setKwh(Number(e.target.value)); }} className="mt-3 w-full" />
            <div className="mt-3 flex flex-wrap gap-2">
              {!mine && <Toggle on={seasons} set={setSeasons} label={w.tSeasons} hint={w.tSeasonsHint} />}
              <Toggle on={f.locked} set={(v) => setF({ ...f, locked: v })} label={w.tLocked} />
              <Toggle on={f.noCliffs} set={(v) => setF({ ...f, noCliffs: v })} label={w.tNoCliffs} />
              <Toggle on={f.green} set={(v) => setF({ ...f, green: v })} label={w.tGreen} />
              <Toggle on={f.rated} set={(v) => setF({ ...f, rated: v })} label={w.tRated} hint={w.tRatedHint} />
              <Toggle on={withConditional} set={setWithConditional} label={w.tAutopay} />
            </div>
            <div className="mt-3">
              <MyMonths start={mine ?? yearFor(kwh, seasons, area)} active={!!mine}
                onUse={(m) => { setMine(m); setKwh(Math.max(200, Math.min(3000, average(m)))); }} onClear={() => setMine(null)} lang={lang} />
            </div>
            <ol className="mt-4 space-y-2">
              {ranked.slice(0, 8).map((r, i) => (
                <li key={r.plan.id}>
                  <Link href={`/plan/${r.plan.id}?${qs}`} className="flex items-center gap-3 rounded-2xl bg-paper px-3 py-3 transition hover:bg-volt-2 sm:px-4">
                    <span className="num w-5 text-right text-ink-2">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{r.plan.planName}</span>
                      <span className="block truncate text-sm text-ink-2">{title(r.plan.provider)}</span>
                      {/* own wrapping line, so the trap chips are never cut off on a small phone */}
                      {(r.plan.pricing!.termMonths <= 3 || traps(r.plan.pricing!).length > 0) && (
                        <span className="mt-1 flex flex-wrap gap-1">
                          {r.plan.pricing!.termMonths <= 3 && <Chip tone="sky">{w.monthPrice(r.plan.pricing!.termMonths)}</Chip>}
                          {traps(r.plan.pricing!).slice(0, 2).map((t) => <Chip key={t.key} tone={t.tone}>{TRAP_LABELS[lang][t.key] ?? t.label}</Chip>)}
                        </span>
                      )}
                    </span>
                    <span className="text-right">
                      <span className="num block text-lg font-semibold">{money(r.annual)}<span className="text-sm text-ink-2">{w.perYear}</span></span>
                      <span className="num block text-xs text-ink-2">{cents(r.avgCents)}/kWh</span>
                    </span>
                  </Link>
                  {i > 0 && (
                    <Link href={`/compare?a=${ranked[0].plan.id}&b=${r.plan.id}&${qs}`} className="ml-11 mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold text-ink-2 hover:bg-paper hover:text-ink">
                      {w.compareWith1}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-ink-2">{w.rankNote(notRanked)}</p>
          </div>

          {ranked.length > 0 && <CurrentPlan plans={plans} best={ranked[0]} includeConditional={withConditional} kwh={kwh} seasons={seasons} qs={qs} mine={!!mine} city={AREAS[area].city} lang={lang} />}

          <JudgeQr />
        </section>
      )}
    </div>
  );
}

function Toggle({ on, set, label, hint }: { on: boolean; set: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => set(!on)}
      className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${on ? "bg-ink text-paper" : "bg-paper-2 text-ink"}`}>
      <span className={`relative h-4 w-7 rounded-full ${on ? "bg-volt" : "bg-ink/20"}`}>
        <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-card transition-all ${on ? "left-3.5" : "left-0.5"}`} />
      </span>
      {label}{hint && <span className={`hidden sm:inline ${on ? "text-paper/60" : "text-ink-2"}`}>· {hint}</span>}
    </button>
  );
}

function Counter({ label, value, of, tone }: { label: string; value: number; of?: number; tone?: "good" }) {
  return (
    <div className={`rounded-2xl px-3 py-1.5 text-right ${tone === "good" ? "bg-good-2" : "bg-card shadow-[var(--shadow-soft)]"}`}>
      <span className="num text-xl font-semibold">{value}{of ? <span className="text-ink-2">/{of}</span> : null}</span>
      <span className="ml-1 text-xs text-ink-2">{label}</span>
    </div>
  );
}

/** Kapi walks along a track as the plans get read, then sits at the end. */
function Walker({ progress, done }: { progress: number; done: boolean }) {
  const pct = Math.min(1, progress) * 100;
  return (
    <div className="relative mt-5 h-12" role="progressbar" aria-label="Plans read" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}>
      <div className="absolute inset-x-0 bottom-1 h-2 overflow-hidden rounded-full bg-paper-2">
        <div className="h-full rounded-full bg-volt transition-[width] duration-150 ease-linear" style={{ width: `${pct}%` }} />
      </div>
      <div className="absolute bottom-2 transition-[left] duration-150 ease-linear" style={{ left: `calc(${pct}% - ${pct / 100} * 2.5rem)` }}>
        <Kapi reading className={`h-10 w-10 ${done ? "" : "walk"}`} />
      </div>
    </div>
  );
}

function Tile({ p, read, w }: { p: ClientPlan; read: boolean; w: Words }) {
  const ok = p.status === "verified";
  const back = ok ? "bg-good-2" : p.status === "mismatch" ? "bg-volt-2" : "bg-paper-2";
  return (
    <div className={`flip ${read ? "is-read" : ""} h-8 sm:h-20`} title={`${p.provider} — ${p.planName}`}>
      <div className="flip-inner h-full">
        <div className="flip-face relative flex h-full items-center justify-center overflow-hidden rounded-md bg-card shadow-[var(--shadow-soft)] sm:block sm:rounded-xl sm:p-2">
          <div className="scanline pointer-events-none absolute inset-x-0 h-1/2 bg-gradient-to-b from-transparent via-volt-2 to-transparent opacity-70" />
          <Kapi reading className="relative h-5 w-5 sm:h-6 sm:w-6" />
          <p className="relative mt-1 hidden text-[0.6875rem] leading-tight text-ink-2 [overflow-wrap:anywhere] sm:line-clamp-2">{title(p.provider)}</p>
        </div>
        <div className={`flip-face flip-back flex h-full items-center justify-center rounded-md shadow-[var(--shadow-soft)] sm:block sm:rounded-xl sm:p-2 sm:pr-7 ${back}`}>
          <span aria-hidden className={`text-sm font-bold sm:hidden ${ok ? "text-good" : "text-ink-2"}`}>{ok ? "✓" : p.status === "mismatch" ? "?" : "–"}</span>
          {ok && read && <span aria-hidden className="stamp absolute right-1.5 top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-good text-[0.6875rem] font-bold text-paper sm:flex">✓</span>}
          <p className="hidden text-[0.6875rem] font-semibold leading-tight [overflow-wrap:anywhere] sm:line-clamp-2">{p.planName}</p>
          {ok && p.pricing ? (
            <p className="num mt-1 hidden text-[0.6875rem] leading-tight sm:block">
              {p.pricing.touPeriods.length ? w.tileTou : `${p.pricing.energyTiers[p.pricing.energyTiers.length - 1].cents.toFixed(1)}¢/kWh`}
              {p.pricing.credits.some((c) => !c.conditional && c.minKwh > 0) ? <span className="text-over"> · {w.tileCliff}</span> : <span className="text-good"> · ✓</span>}
            </p>
          ) : (
            <p className="mt-1 hidden text-[0.6875rem] leading-tight text-ink-2 sm:block">{p.status === "mismatch" ? w.tileMismatch : w.tileUnread}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({ tone, children }: { tone: string; children: React.ReactNode }) {
  const c = tone === "over" ? "bg-over-2 text-over" : tone === "sky" ? "bg-[#e1e9fb] text-sky" : "bg-volt-2 text-ink";
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold ${c}`}>{children}</span>;
}

function creditLine(r: Ranked): number | undefined {
  const c = r.plan.pricing!.credits.filter((x) => !x.conditional && x.minKwh > 0).sort((a, b) => b.dollars - a.dollars)[0];
  return c?.minKwh;
}

function Reveal({ kwh, seasons, ranked, pick, locked, mine, qs, lang, area }: { kwh: number; seasons: boolean; ranked: Ranked[]; pick: ClientPlan | null; locked: boolean; mine: boolean; qs: string; lang: Lang; area: Area }) {
  const w = words(lang, area);
  const best = ranked[0];
  const pickRow = pick ? ranked.find((r) => r.plan.id === pick.id) : undefined;
  const pickRank = pickRow ? ranked.indexOf(pickRow) + 1 : 0;
  const gap = pickRow ? pickRow.annual - best.annual : 0;
  const why = pickRow ? whyLine(pickRow.plan.pricing!, pickRow.months, lang) : null;
  const line = pickRow ? creditLine(pickRow) : undefined;
  // the plan whose real yearly price is furthest above what its 1,000 kWh sticker price suggests
  const used = best.months.reduce((s, m) => s + m, 0);
  const surprise = [...ranked].map((r) => ({ r, over: r.annual - (r.plan.ptc.k1000 / 100) * used })).sort((a, b) => b.over - a.over)[0];
  const shareText = pickRow && gap >= 1 ? w.shareGap(money(gap)) : w.shareBest;
  const surpriseWhy = surprise ? whyLine(surprise.r.plan.pricing!, surprise.r.months, lang) : null;
  const sb = surprise ? w.surpriseBody(cents(surprise.r.plan.ptc.k1000), cents(surprise.r.avgCents), money(surprise.over)) : null;

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-[2rem] bg-ink p-5 text-paper shadow-[var(--shadow-lift)] sm:p-8">
        <Kapi pose={pickRow && gap >= 1 ? "surprised" : "celebrating"} className="absolute right-4 top-4 h-14 w-14 sm:right-6 sm:top-6 sm:h-24 sm:w-24" />
        <p className="pr-16 text-sm font-semibold text-volt sm:pr-28">
          {w.atUsage(kwh, seasons, mine)}
        </p>
        {pickRow && gap >= 1 ? (
          <>
            <p className="display mt-3 text-[4.5rem] font-extrabold leading-[0.85] text-volt sm:text-[7rem] lg:text-[8.5rem]">
              <span className="num tracking-tight"><CountUp value={gap} format={money} /></span>
            </p>
            <h2 className="display mt-3 text-2xl font-extrabold leading-tight sm:text-4xl">
              {w.moreAYear(locked)}
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <PlanCard tone="bad" eyebrow={w.stateFirst(pickRank)} r={pickRow} sticker={pickRow.plan.ptc.k1000} w={w} />
              <PlanCard tone="good" eyebrow={w.yourFirst} r={best} sticker={best.plan.ptc.k1000} w={w} />
            </div>
            {why && (
              <div className="mt-6 rounded-3xl bg-paper/10 p-4 sm:p-5">
                <p className="text-lg font-semibold leading-snug sm:text-xl"><span className="text-volt">{w.why}</span> {why}</p>
                {(seasons || mine) && <div className="mt-4"><YearBars months={pickRow.months} line={line} lineLabel={line ? w.creditNeeds(line) : undefined} dark lang={lang} /></div>}
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="display mt-3 text-4xl font-extrabold leading-tight sm:text-6xl">{w.bestTitle}<span className="text-volt">{best.plan.planName}</span></h2>
            <p className="mt-3 text-lg text-paper/80">{w.bestBody(title(best.plan.provider), money(best.annual))}</p>
          </>
        )}
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href={`/plan/${best.plan.id}?${qs}`} className="rounded-full bg-volt px-5 py-2.5 font-bold text-ink">{w.seeMath}</Link>
          {pickRow && gap >= 1 && <Link href={`/plan/${pickRow.plan.id}?${qs}`} className="rounded-full bg-paper/15 px-5 py-2.5 font-bold">{w.openFirst}</Link>}
          {pickRow && gap >= 1 && <Link href={`/compare?a=${best.plan.id}&b=${pickRow.plan.id}&${qs}`} className="rounded-full bg-paper/15 px-5 py-2.5 font-bold">{w.sideBySide}</Link>}
          <ShareButton text={shareText} lang={lang} area={area} />
        </div>
      </div>

      {surprise && sb && surprise.over >= 25 && surprise.r.plan.id !== pickRow?.plan.id && (
        <div className="rounded-3xl bg-over-2 p-5 shadow-[var(--shadow-soft)] sm:p-6">
          <p className="text-sm font-semibold text-over">{w.surpriseEyebrow}</p>
          <h3 className="display mt-2 text-2xl font-extrabold leading-tight">{surprise.r.plan.planName} <span className="text-base font-semibold text-ink-2">· {title(surprise.r.plan.provider)}</span></h3>
          <p className="mt-2">
            {sb[0]}<b className="num">{sb[1]}</b>{sb[2]}<b className="num text-over">{sb[3]}</b>{sb[4]}<b className="num">{sb[5]}</b>{sb[6]}
          </p>
          {surpriseWhy && <p className="mt-2 font-medium">{surpriseWhy}</p>}
          <Link href={`/plan/${surprise.r.plan.id}?${qs}`} className="mt-4 inline-block rounded-full bg-ink px-4 py-2 font-bold text-paper">{w.showWhy}</Link>
        </div>
      )}
    </div>
  );
}

function PlanCard({ tone, eyebrow, r, sticker, w }: { tone: "good" | "bad"; eyebrow: string; r: Ranked; sticker: number; w: Words }) {
  return (
    <div className={`rounded-3xl p-4 sm:p-5 ${tone === "good" ? "bg-good-2 text-ink" : "bg-paper/10"}`}>
      <p className={`text-xs font-bold uppercase tracking-wide ${tone === "good" ? "text-good" : "text-volt"}`}>{eyebrow}</p>
      <p className="mt-1 text-lg font-bold leading-tight">{r.plan.planName}</p>
      <p className={`text-sm ${tone === "good" ? "text-ink-2" : "text-paper/70"}`}>{title(r.plan.provider)}</p>
      <div className="num mt-3 flex items-end justify-between gap-2">
        <span className="text-3xl font-semibold">{money(r.annual)}<span className="text-sm opacity-70">{w.perYear}</span></span>
        <span className="text-right text-sm leading-tight opacity-80 lg:text-base">{w.sticker} {cents(sticker)}<br />{w.real} {cents(r.avgCents)}</span>
      </div>
    </div>
  );
}
