"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Kapi } from "@/components/Kapi";
import { JudgeQr } from "@/components/JudgeQr";
import { ShareButton } from "@/components/ShareButton";
import { YearBars } from "@/components/YearBars";
import { type ClientPlan, type Ranked, ptcTopPick, rank, traps, whyLine } from "@/lib/rank";

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const cents = (n: number) => `${n.toFixed(1)}¢`;
const short = (s: string) => s.replace(/\b(LLC|INC|LP|L\.P\.|CO)\b\.?/gi, "").replace(/\(TX\)/gi, "").replace(/\s+/g, " ").trim();
const title = (s: string) => short(s).toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

/** The wall replays real reads. Order and pace come from how long each read really took, sped up so it fits a demo. */
function useReveal(plans: ClientPlan[], totalMs = 9000) {
  const order = useMemo(() => {
    const max = Math.max(...plans.map((p) => p.readMs || 1), 1);
    return plans.map((p, i) => ({ id: p.id, at: 400 + ((i % 12) * 140) + (p.readMs / max) * (totalMs - 2200) }));
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

export function Wall({ plans, kwh: initialKwh, builtAt, seasons: initialSeasons }: { plans: ClientPlan[]; kwh: number; builtAt: string; seasons: boolean }) {
  const { readIds, done, skip } = useReveal(plans);
  const [kwh, setKwh] = useState(initialKwh);
  const [seasons, setSeasons] = useState(initialSeasons);
  const [withConditional, setWithConditional] = useState(true);
  const verifiedRead = plans.filter((p) => readIds.has(p.id) && p.status === "verified").length;
  const ranked = useMemo(() => rank(plans, kwh, { includeConditional: withConditional, seasons }), [plans, kwh, withConditional, seasons]);
  const pick = useMemo(() => ptcTopPick(plans), [plans]);
  const notRanked = plans.filter((p) => p.status === "verified" && !p.prepaid && p.rateType.toLowerCase() === "variable").length;
  const when = new Date(builtAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-end gap-3">
          <Kapi reading className={`h-14 w-14 shrink-0 ${done ? "" : "animate-bounce [animation-duration:1.6s]"}`} />
          <div>
            <h1 className="display text-3xl font-extrabold sm:text-4xl">{done ? "Every plan, read." : "Reading the fine print…"}</h1>
            <p className="mt-1 max-w-2xl text-sm text-ink-2">
              Each tile is one real Houston plan&apos;s fine-print label, read on {when}. ✓ means our math rebuilt the label&apos;s own
              prices to the tenth of a cent.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Counter label="read" value={readIds.size} of={plans.length} />
          <Counter label="checked ✓" value={verifiedRead} tone="good" />
          {!done && <button onClick={skip} className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper">Skip</button>}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-10">
        {plans.map((p) => <Tile key={p.id} p={p} read={readIds.has(p.id)} />)}
      </div>

      {done && ranked.length > 0 && (
        <section className="pop mt-10 space-y-6">
          <Reveal kwh={kwh} seasons={seasons} ranked={ranked} pick={pick} />

          <div className="rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
            <label htmlFor="slide" className="block text-base font-semibold">
              You average <span className="num">{kwh.toLocaleString()} kWh</span> a month
            </label>
            <input id="slide" type="range" min={200} max={3000} step={10} value={kwh} onChange={(e) => setKwh(Number(e.target.value))} className="mt-3 w-full" />
            <div className="mt-3 flex flex-wrap gap-2">
              <Toggle on={seasons} set={setSeasons} label="Texas seasons" hint="summer AC ≈ 2× spring" />
              <Toggle on={withConditional} set={setWithConditional} label="Count autopay discounts" />
            </div>
            <ol className="mt-4 space-y-2">
              {ranked.slice(0, 8).map((r, i) => (
                <li key={r.plan.id}>
                  <Link href={`/plan/${r.plan.id}?kwh=${kwh}${seasons ? "" : "&flat=1"}`} className="flex items-center gap-3 rounded-2xl bg-paper px-3 py-3 transition hover:bg-volt-2 sm:px-4">
                    <span className="num w-5 text-right text-ink-2">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{r.plan.planName}</span>
                      <span className="block truncate text-sm text-ink-2">{title(r.plan.provider)}
                        {r.plan.pricing!.termMonths <= 3 && <Chip tone="sky">{r.plan.pricing!.termMonths}-month price</Chip>}
                        {traps(r.plan.pricing!).slice(0, 2).map((t) => <Chip key={t.key} tone={t.tone}>{t.label}</Chip>)}</span>
                    </span>
                    <span className="text-right">
                      <span className="num block text-lg font-semibold">{money(r.annual)}<span className="text-sm text-ink-2">/yr</span></span>
                      <span className="num block text-xs text-ink-2">{cents(r.avgCents)}/kWh</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-ink-2">
              Yearly cost at today&apos;s prices, before taxes. {notRanked} variable-rate plans aren&apos;t ranked: their price can change every
              month, so a yearly number would be a guess. Prepaid plans and plans we couldn&apos;t verify aren&apos;t ranked either.
            </p>
          </div>

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
      {label}{hint && <span className={on ? "text-paper/60" : "text-ink-2"}>· {hint}</span>}
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

function Tile({ p, read }: { p: ClientPlan; read: boolean }) {
  const ok = p.status === "verified";
  return (
    <div className={`flip ${read ? "is-read" : ""} h-24`} title={`${p.provider} — ${p.planName}`}>
      <div className="flip-inner h-full">
        <div className="flip-face relative h-full overflow-hidden rounded-xl bg-card p-2 shadow-[var(--shadow-soft)]">
          <div className="scanline pointer-events-none absolute inset-x-0 h-1/2 bg-gradient-to-b from-transparent via-volt-2 to-transparent opacity-70" />
          <Kapi reading className="relative h-7 w-7" />
          <p className="relative mt-1 line-clamp-2 text-[11px] leading-tight text-ink-2">{title(p.provider)}</p>
        </div>
        <div className={`flip-face flip-back h-full rounded-xl p-2 shadow-[var(--shadow-soft)] ${ok ? "bg-good-2" : p.status === "mismatch" ? "bg-volt-2" : "bg-paper-2"}`}>
          <p className="line-clamp-2 text-[11px] font-semibold leading-tight">{p.planName}</p>
          {ok && p.pricing ? (
            <p className="num mt-1 text-[11px] leading-tight">
              {p.pricing.touPeriods.length ? "time-of-use" : `${p.pricing.energyTiers[p.pricing.energyTiers.length - 1].cents.toFixed(1)}¢/kWh`}
              {p.pricing.credits.some((c) => !c.conditional && c.minKwh > 0) && <span className="block text-over">credit cliff</span>}
              <span className="block text-good">✓ 3/3 match</span>
            </p>
          ) : (
            <p className="mt-1 text-[11px] leading-tight text-ink-2">{p.status === "mismatch" ? "Didn't add up — not ranked" : "Couldn't open"}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({ tone, children }: { tone: string; children: React.ReactNode }) {
  const c = tone === "over" ? "bg-over-2 text-over" : tone === "sky" ? "bg-[#e1e9fb] text-sky" : "bg-volt-2 text-ink";
  return <span className={`ml-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${c}`}>{children}</span>;
}

function creditLine(r: Ranked): number | undefined {
  const c = r.plan.pricing!.credits.filter((x) => !x.conditional && x.minKwh > 0).sort((a, b) => b.dollars - a.dollars)[0];
  return c?.minKwh;
}

function Reveal({ kwh, seasons, ranked, pick }: { kwh: number; seasons: boolean; ranked: Ranked[]; pick: ClientPlan | null }) {
  const best = ranked[0];
  const pickRow = pick ? ranked.find((r) => r.plan.id === pick.id) : undefined;
  const pickRank = pickRow ? ranked.indexOf(pickRow) + 1 : 0;
  const gap = pickRow ? pickRow.annual - best.annual : 0;
  const why = pickRow ? whyLine(pickRow.plan.pricing!, pickRow.months) : null;
  const line = pickRow ? creditLine(pickRow) : undefined;
  // the plan whose real yearly price is furthest above what its 1,000 kWh sticker price suggests
  const used = best.months.reduce((s, m) => s + m, 0);
  const surprise = [...ranked].map((r) => ({ r, over: r.annual - (r.plan.ptc.k1000 / 100) * used })).sort((a, b) => b.over - a.over)[0];
  const shareText = pickRow && gap >= 1
    ? `The state site's #1 power plan would cost me ${money(gap)} more a year than my best plan. Wattch read the fine print on every Houston plan:`
    : `Wattch read the fine print on every Houston power plan and found my best one:`;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[2rem] bg-ink p-5 text-paper shadow-[var(--shadow-lift)] sm:p-8">
        <p className="text-sm font-semibold text-volt">
          At {kwh.toLocaleString()} kWh a month{seasons ? ", with real Texas seasons" : ", same every month"}
        </p>
        {pickRow && gap >= 1 ? (
          <>
            <p className="display mt-3 text-[4.5rem] font-extrabold leading-[0.85] text-volt sm:text-[7rem] lg:text-[8.5rem]">
              <span className="num tracking-tight">{money(gap)}</span>
            </p>
            <h2 className="display mt-3 text-2xl font-extrabold leading-tight sm:text-4xl">
              more a year — if you pick the plan the state site lists first.
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <PlanCard tone="bad" eyebrow={`State site's #1 · #${pickRank} for you`} r={pickRow} sticker={pickRow.plan.ptc.k1000} />
              <PlanCard tone="good" eyebrow="Your #1" r={best} sticker={best.plan.ptc.k1000} />
            </div>
            {why && (
              <div className="mt-6 rounded-3xl bg-paper/10 p-4 sm:p-5">
                <p className="text-lg font-semibold leading-snug sm:text-xl"><span className="text-volt">Why?</span> {why}</p>
                {seasons && <div className="mt-4"><YearBars months={pickRow.months} line={line} lineLabel={line ? `credit needs ${line.toLocaleString()} kWh` : undefined} dark /></div>}
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="display mt-3 text-4xl font-extrabold leading-tight sm:text-6xl">Your best plan: <span className="text-volt">{best.plan.planName}</span></h2>
            <p className="mt-3 text-lg text-paper/80">
              {title(best.plan.provider)} · <span className="num">{money(best.annual)}</span> a year. Here it matches the state site&apos;s
              first pick — drag the slider to see where that stops being true.
            </p>
          </>
        )}
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href={`/plan/${best.plan.id}?kwh=${kwh}${seasons ? "" : "&flat=1"}`} className="rounded-full bg-volt px-5 py-2.5 font-bold text-ink">See the math</Link>
          {pickRow && gap >= 1 && <Link href={`/plan/${pickRow.plan.id}?kwh=${kwh}${seasons ? "" : "&flat=1"}`} className="rounded-full bg-paper/15 px-5 py-2.5 font-bold">Open the #1 plan&apos;s fine print</Link>}
          <ShareButton kwh={kwh} text={shareText} flat={!seasons} />
        </div>
      </div>

      {surprise && surprise.over >= 25 && surprise.r.plan.id !== pickRow?.plan.id && (
        <div className="rounded-3xl bg-over-2 p-5 shadow-[var(--shadow-soft)] sm:p-6">
          <p className="text-sm font-semibold text-over">Biggest gap between sticker and real price</p>
          <h3 className="display mt-2 text-2xl font-extrabold leading-tight">{surprise.r.plan.planName} <span className="text-base font-semibold text-ink-2">· {title(surprise.r.plan.provider)}</span></h3>
          <p className="mt-2">
            Advertised at <b className="num">{cents(surprise.r.plan.ptc.k1000)}</b> per kWh. Over your year you&apos;d really pay{" "}
            <b className="num text-over">{cents(surprise.r.avgCents)}</b> — <b className="num">{money(surprise.over)}</b> more than the sticker price suggests.
          </p>
          {whyLine(surprise.r.plan.pricing!, surprise.r.months) && <p className="mt-2 font-medium">{whyLine(surprise.r.plan.pricing!, surprise.r.months)}</p>}
          <Link href={`/plan/${surprise.r.plan.id}?kwh=${kwh}${seasons ? "" : "&flat=1"}`} className="mt-4 inline-block rounded-full bg-ink px-4 py-2 font-bold text-paper">Show me why</Link>
        </div>
      )}
    </div>
  );
}

function PlanCard({ tone, eyebrow, r, sticker }: { tone: "good" | "bad"; eyebrow: string; r: Ranked; sticker: number }) {
  return (
    <div className={`rounded-3xl p-4 sm:p-5 ${tone === "good" ? "bg-good-2 text-ink" : "bg-paper/10"}`}>
      <p className={`text-xs font-bold uppercase tracking-wide ${tone === "good" ? "text-good" : "text-volt"}`}>{eyebrow}</p>
      <p className="mt-1 text-lg font-bold leading-tight">{r.plan.planName}</p>
      <p className={`text-sm ${tone === "good" ? "text-ink-2" : "text-paper/70"}`}>{title(r.plan.provider)}</p>
      <div className="num mt-3 flex items-end justify-between gap-2">
        <span className="text-3xl font-semibold">{money(r.annual)}<span className="text-sm opacity-70">/yr</span></span>
        <span className="text-right text-xs leading-tight opacity-80">sticker {cents(sticker)}<br />real {cents(r.avgCents)}</span>
      </div>
    </div>
  );
}
