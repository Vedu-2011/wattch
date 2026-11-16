"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Kapi } from "@/components/Kapi";
import { type ClientPlan, ptcTopPick, rank, traps } from "@/lib/rank";

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const cents = (n: number) => `${n.toFixed(1)}¢`;
const short = (s: string) => s.replace(/\b(LLC|INC|LP|L\.P\.|CO)\b\.?/gi, "").replace(/\s+/g, " ").trim();
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

export function Wall({ plans, kwh: initialKwh, builtAt }: { plans: ClientPlan[]; kwh: number; builtAt: string }) {
  const { readIds, done, skip } = useReveal(plans);
  const [kwh, setKwh] = useState(initialKwh);
  const [withConditional, setWithConditional] = useState(true);
  const verifiedRead = plans.filter((p) => readIds.has(p.id) && p.status === "verified").length;
  const ranked = useMemo(() => rank(plans, kwh, withConditional), [plans, kwh, withConditional]);
  const pick = useMemo(() => ptcTopPick(plans), [plans]);
  const when = new Date(builtAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  return (
    <div className="mx-auto max-w-6xl px-5 pt-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display text-3xl font-extrabold sm:text-4xl">{done ? "Every plan, read." : "Reading the fine print…"}</h1>
          <p className="mt-1 text-sm text-ink-2">
            Each tile is one real Houston plan&apos;s fine-print label, read on {when}. ✓ means our math rebuilt the label&apos;s own
            prices to the cent.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Counter label="read" value={readIds.size} of={plans.length} />
          <Counter label="checked ✓" value={verifiedRead} tone="good" />
          {!done && <button onClick={skip} className="rounded-full bg-paper-2 px-3 py-1.5 text-sm font-medium">Skip</button>}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-10">
        {plans.map((p) => <Tile key={p.id} p={p} read={readIds.has(p.id)} />)}
      </div>

      {done && ranked.length > 0 && (
        <section className="pop mt-10 space-y-6">
          <Reveal kwh={kwh} ranked={ranked} pick={pick} />
          <div className="rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label htmlFor="slide" className="text-base font-semibold">
                Your usage: <span className="num">{kwh.toLocaleString()} kWh</span> a month
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={withConditional} onChange={(e) => setWithConditional(e.target.checked)} />
                Count autopay-style discounts
              </label>
            </div>
            <input id="slide" type="range" min={200} max={3000} step={10} value={kwh} onChange={(e) => setKwh(Number(e.target.value))} className="mt-3 w-full" />
            <ol className="mt-4 space-y-2">
              {ranked.slice(0, 8).map((r, i) => (
                <li key={r.plan.id}>
                  <Link href={`/plan/${r.plan.id}?kwh=${kwh}`} className="flex items-center gap-3 rounded-2xl bg-paper px-4 py-3 transition hover:bg-volt-2">
                    <span className="num w-6 text-right text-ink-2">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{r.plan.planName}</span>
                      <span className="block truncate text-sm text-ink-2">{title(r.plan.provider)}
                        {traps(r.plan.pricing!).slice(0, 2).map((t) => <TrapChip key={t.key} t={t} />)}</span>
                    </span>
                    <span className="text-right">
                      <span className="num block text-lg font-semibold">{money(r.annual)}<span className="text-sm text-ink-2">/yr</span></span>
                      <span className="num block text-xs text-ink-2">{money(r.monthly)}/mo · {cents(r.avgCents)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}
    </div>
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
              {p.pricing.touPeriods.length ? "time-of-use" : `${p.pricing.energyTiers[0].cents.toFixed(1)}¢/kWh`}
              {p.pricing.credits.some((c) => c.minKwh > 0) && <span className="block text-over">credit cliff</span>}
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

function TrapChip({ t }: { t: { label: string; tone: string } }) {
  const c = t.tone === "over" ? "bg-over-2 text-over" : t.tone === "sky" ? "bg-[#e1e9fb] text-sky" : "bg-volt-2 text-ink";
  return <span className={`ml-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${c}`}>{t.label}</span>;
}

function Reveal({ kwh, ranked, pick }: { kwh: number; ranked: ReturnType<typeof rank>; pick: ClientPlan | null }) {
  const best = ranked[0];
  const pickRow = pick ? ranked.find((r) => r.plan.id === pick.id) : undefined;
  const pickRank = pickRow ? ranked.indexOf(pickRow) + 1 : 0;
  // the plan whose real price at this usage is furthest above the price it advertises at 1,000 kWh
  const surprise = [...ranked].map((r) => ({ r, gap: r.avgCents - r.plan.ptc.k1000 })).sort((a, b) => b.gap - a.gap)[0];
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-3xl bg-ink p-6 text-paper shadow-[var(--shadow-lift)]">
        <p className="text-sm font-semibold text-volt">At {kwh.toLocaleString()} kWh a month</p>
        {pickRow && pickRow.plan.id !== best.plan.id ? (
          <>
            <h2 className="display mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">
              The state site&apos;s #1 plan is <span className="text-volt">#{pickRank}</span> for you.
            </h2>
            <p className="mt-3 text-paper/80">
              Power to Choose lists <b>{pickRow.plan.planName}</b> first (at 1,000 kWh). At your usage it costs{" "}
              <b className="num text-volt">{money(pickRow.annual - best.annual)}</b> more a year than your best plan,{" "}
              <b>{best.plan.planName}</b> from {title(best.plan.provider)}.
            </p>
          </>
        ) : (
          <>
            <h2 className="display mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">Your best plan: {best.plan.planName}</h2>
            <p className="mt-3 text-paper/80">
              {title(best.plan.provider)} · <span className="num">{money(best.annual)}</span> a year. Here it matches the state site&apos;s
              first pick — drag the slider to see where that stops being true.
            </p>
          </>
        )}
        <Link href={`/plan/${best.plan.id}?kwh=${kwh}`} className="mt-5 inline-block rounded-full bg-volt px-4 py-2 font-bold text-ink">See the math</Link>
      </div>
      {surprise && surprise.gap >= 0.5 && (
        <div className="rounded-3xl bg-over-2 p-6 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-semibold text-over">Biggest surprise at your usage</p>
          <h3 className="display mt-2 text-2xl font-extrabold leading-tight">{surprise.r.plan.planName}</h3>
          <p className="mt-2">
            Advertised at <b className="num">{cents(surprise.r.plan.ptc.k1000)}</b> per kWh. At {kwh.toLocaleString()} kWh you&apos;d really pay{" "}
            <b className="num text-over">{cents(surprise.r.avgCents)}</b> — that&apos;s <b className="num">{money(surprise.r.annual - surprise.r.plan.ptc.k1000 / 100 * kwh * 12)}</b> more a year than the sticker.
          </p>
          <Link href={`/plan/${surprise.r.plan.id}?kwh=${kwh}`} className="mt-4 inline-block rounded-full bg-ink px-4 py-2 font-bold text-paper">Show me why</Link>
        </div>
      )}
    </div>
  );
}
