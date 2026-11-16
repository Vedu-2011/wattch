"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CountUp } from "@/components/CountUp";
import { JudgeQr } from "@/components/JudgeQr";
import { Kapi } from "@/components/Kapi";
import { YearBars } from "@/components/YearBars";

type P = { id: string; name: string; provider: string; sticker: number; annual: number; real: number };
export type DemoData = {
  kwh: number; total: number; verified: number; withTrap: number; ranked: number;
  pick: P & { months: number[] }; best: P; pickRank: number; gap: number; why: string | null; creditLine: number | null;
};

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const tidy = (s: string) => s.replace(/\b(LLC|INC|LP|L\.P\.|CO)\b\.?/gi, "").replace(/\(TX\)/gi, "").replace(/\s+/g, " ").trim()
  .toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const SCENE_MS = 6000;

/** Scripted, click-free walk-through. Auto-advances; ← → or space to drive it by hand; tap Pause to hold a scene. */
export function Demo({ d }: { d: DemoData }) {
  const scenes = [
    <Scene key="a" eyebrow="Houston, today">
      <h1 className="display text-5xl font-extrabold leading-[0.95] sm:text-8xl"><span className="num text-volt">{d.total}</span> power plans.</h1>
      <p className="mt-6 max-w-3xl text-xl text-paper/80 sm:text-3xl">The state&apos;s Power to Choose site sorts them by one sticker price — the price at exactly 1,000 kWh.</p>
    </Scene>,
    <Scene key="b" eyebrow="The state site's #1 pick">
      <h2 className="display text-4xl font-extrabold leading-tight sm:text-7xl">{d.pick.name}</h2>
      <p className="mt-2 text-xl text-paper/70 sm:text-2xl">{tidy(d.pick.provider)}</p>
      <p className="mt-8 text-2xl sm:text-4xl">Sticker price: <b className="num text-volt">{d.pick.sticker.toFixed(1)}¢</b> per kWh.</p>
      <p className="mt-2 text-xl text-paper/70 sm:text-2xl">Looks like a steal. So I had Wattch read the fine print.</p>
    </Scene>,
    <Scene key="c" eyebrow="AI reads, code checks">
      <div className="flex items-end gap-4"><Kapi reading className="h-20 w-20 sm:h-28 sm:w-28" />
        <h2 className="display text-4xl font-extrabold leading-tight sm:text-7xl"><span className="num text-volt"><CountUp value={d.verified} format={(n) => String(Math.round(n))} ms={1800} /></span> of {d.total} labels check out.</h2>
      </div>
      <p className="mt-6 max-w-3xl text-xl text-paper/80 sm:text-3xl">AI read every plan&apos;s fine-print label. Then plain code rebuilt the label&apos;s own prices to the tenth of a cent — so I know the reading is right.</p>
    </Scene>,
    <Scene key="d" eyebrow={`A Houston home using ${d.kwh.toLocaleString("en-US")} kWh a month`}>
      <Kapi pose="surprised" className="float-right h-20 w-20 sm:h-36 sm:w-36" />
      <p className="display text-[5rem] font-extrabold leading-[0.85] text-volt sm:text-[11rem]"><span className="num"><CountUp value={d.gap} format={money} /></span></p>
      <h2 className="display mt-4 text-3xl font-extrabold leading-tight sm:text-6xl">more a year on the state site&apos;s #1.</h2>
      <p className="mt-4 text-xl text-paper/80 sm:text-3xl">Over a real Houston year it ranks <b className="num text-volt">#{d.pickRank}</b> of {d.ranked}.</p>
    </Scene>,
    <Scene key="e" eyebrow="Why?">
      <h2 className="display text-3xl font-extrabold leading-tight sm:text-6xl">{d.why}</h2>
      <div className="mt-8 max-w-4xl"><YearBars months={d.pick.months} line={d.creditLine ?? undefined} lineLabel={d.creditLine ? `credit needs ${d.creditLine.toLocaleString("en-US")} kWh` : undefined} dark /></div>
      <p className="mt-4 text-lg text-paper/70 sm:text-2xl">Houston summers clear the line. Spring, fall and winter don&apos;t.</p>
    </Scene>,
    <Scene key="f" eyebrow="The plan that's really cheapest for this home">
      <Kapi pose="celebrating" className="float-right h-20 w-20 sm:h-32 sm:w-32" />
      <h2 className="display text-4xl font-extrabold leading-tight sm:text-7xl">{d.best.name}</h2>
      <p className="mt-2 text-xl text-paper/70 sm:text-2xl">{tidy(d.best.provider)}</p>
      <div className="mt-8 grid max-w-4xl gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-paper/10 p-5"><p className="text-sm font-bold uppercase text-volt lg:text-lg">State site&apos;s #1</p><p className="num mt-2 text-4xl font-semibold lg:text-7xl">{money(d.pick.annual)}<span className="text-lg opacity-70 lg:text-3xl">/yr</span></p><p className="num text-paper/70 lg:mt-1 lg:text-2xl">really {d.pick.real.toFixed(1)}¢/kWh</p></div>
        <div className="rounded-3xl bg-good-2 p-5 text-ink"><p className="text-sm font-bold uppercase text-good lg:text-lg">Wattch&apos;s #1</p><p className="num mt-2 text-4xl font-semibold lg:text-7xl">{money(d.best.annual)}<span className="text-lg opacity-70 lg:text-3xl">/yr</span></p><p className="num text-ink-2 lg:mt-1 lg:text-2xl">really {d.best.real.toFixed(1)}¢/kWh</p></div>
      </div>
    </Scene>,
    <Scene key="g" eyebrow="Now you">
      <div className="max-w-4xl text-ink"><JudgeQr /></div>
      <p className="mt-6 text-lg text-paper/70 sm:text-2xl">{d.withTrap} plans on today&apos;s list have a trap like this one. <Link href="/traps" className="underline underline-offset-4">See them all</Link>.</p>
    </Scene>,
  ];
  const n = scenes.length;
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const go = useCallback((to: number) => setI(Math.max(0, Math.min(n - 1, to))), [n]);
  useEffect(() => {
    if (!playing || i >= n - 1) return;
    const t = setTimeout(() => setI((x) => x + 1), SCENE_MS);
    return () => clearTimeout(t);
  }, [playing, i, n]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(i + 1);
      else if (e.key === "ArrowLeft") go(i - 1);
      else if (e.key === " ") { e.preventDefault(); setPlaying((p) => !p); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, go]);

  return (
    <div className="mx-auto mt-4 max-w-6xl px-4 sm:px-5">
      <div className="relative flex min-h-[70vh] flex-col justify-center overflow-hidden rounded-[2rem] bg-ink p-6 text-paper shadow-[var(--shadow-lift)] sm:p-12">
        <div aria-live="polite">{scenes[i]}</div>
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-paper/10">
          {playing && i < n - 1 && <div key={i} className="demo-bar h-full bg-volt" style={{ animationDuration: `${SCENE_MS}ms` }} />}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex">
          {scenes.map((_, j) => (
            <button key={j} type="button" onClick={() => go(j)} aria-label={`Scene ${j + 1} of ${n}`} aria-current={j === i}
              className="flex h-6 min-w-6 items-center justify-center px-0.5">
              <span className={`block h-2.5 rounded-full transition-all ${j === i ? "w-8 bg-ink" : "w-2.5 bg-ink/20"}`} />
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 whitespace-nowrap text-sm sm:text-base">
          <button type="button" onClick={() => go(i - 1)} disabled={i === 0} className="rounded-full bg-card px-4 py-2 font-semibold shadow-[var(--shadow-soft)] disabled:opacity-40">Back</button>
          <button type="button" onClick={() => setPlaying((p) => !p)} className="rounded-full bg-card px-4 py-2 font-semibold shadow-[var(--shadow-soft)]">{playing ? "Pause" : "Play"}</button>
          <button type="button" onClick={() => go(i + 1)} disabled={i === n - 1} className="rounded-full bg-ink px-4 py-2 font-semibold text-paper disabled:opacity-40">Next</button>
          <Link href={`/wall?kwh=${d.kwh}`} className="rounded-full bg-volt px-4 py-2 font-bold text-ink">Open the real thing</Link>
        </div>
      </div>
    </div>
  );
}

function Scene({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <div className="fade-in">
      <p className="mb-4 text-sm font-bold uppercase tracking-wide text-volt sm:text-base">{eyebrow}</p>
      {children}
    </div>
  );
}
