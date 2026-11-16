"use client";
import { useState } from "react";
import { Kapi } from "@/components/Kapi";
import { TrapCarousel } from "@/components/TrapCarousel";
import { UsagePicker } from "@/components/UsagePicker";
import type { TrapCard } from "@/lib/hero";
import { type Lang, words } from "@/lib/i18n";
import type { Area } from "@/lib/plans/ptc";

/** One area's home-page numbers, computed on the server (src/components/HomeView.tsx). */
export type AreaHero = { total: number; read: number; verified: number; withTrap: number; date: string; cards: TrapCard[] };

/** Home hero: picking Dallas–Fort Worth in the form switches the badge, stats and trap examples too — no reload. */
export function HomeHero({ lang, heroes }: { lang: Lang; heroes: Record<Area, AreaHero> }) {
  const [area, setArea] = useState<Area>("houston");
  const w = words(lang, area);
  const h = heroes[area];
  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
      <div aria-live="polite">
        <p className="inline-flex items-center gap-2 rounded-full bg-volt-2 px-3 py-1 text-sm font-semibold">
          <span className="h-2 w-2 rounded-full bg-good" /> {w.badge(h.total, h.date)}
        </p>
        <h1 className="display mt-5 text-[2.6rem] font-extrabold leading-[0.95] sm:text-7xl">{w.heroTitle}</h1>
        <p className="mt-5 max-w-xl text-base text-ink-2 sm:text-lg">{w.heroBody}</p>
        <dl className="mt-6 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
          <Stat n={h.read} label={w.statRead} />
          <Stat n={h.verified} label={w.statChecked} />
          <Stat n={h.withTrap} label={w.statTrap} hot />
        </dl>
        <TrapCarousel key={area} cards={h.cards} lang={lang} area={area} />
      </div>
      <div className="relative">
        <Kapi reading className="absolute -top-16 right-3 z-10 h-20 w-20 drop-shadow-md sm:-top-20 sm:h-24 sm:w-24" />
        <UsagePicker lang={lang} area={area} onArea={setArea} />
      </div>
    </div>
  );
}

function Stat({ n, label, hot = false }: { n: number; label: string; hot?: boolean }) {
  return (
    <div className={`rounded-2xl px-3 py-3 sm:px-4 ${hot ? "bg-ink text-paper" : "bg-card shadow-[var(--shadow-soft)]"}`}>
      <dt className="sr-only">{label}</dt>
      <dd className={`num text-2xl font-semibold sm:text-3xl leading-none ${hot ? "text-volt" : ""}`}>{n}</dd>
      <dd className={`mt-1 text-xs font-medium ${hot ? "text-paper/70" : "text-ink-2"}`}>{label}</dd>
    </div>
  );
}
