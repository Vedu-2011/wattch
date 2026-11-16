"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { TrapCard } from "@/lib/hero";
import { type Lang, words } from "@/lib/i18n";
import type { Area } from "@/lib/plans/ptc";

const tidy = (s: string) => s.replace(/\b(LLC|INC|LP|L\.P\.|CO)\b\.?/gi, "").replace(/\(TX\)/gi, "").replace(/\s+/g, " ").trim()
  .toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

/** One real trap at a time, every 5 seconds. Pauses on hover/focus; no auto-advance with reduced motion. */
export function TrapCarousel({ cards, lang = "en", area = "houston" }: { cards: TrapCard[]; lang?: Lang; area?: Area }) {
  const w = words(lang, area);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || cards.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % cards.length), 5000);
    return () => clearInterval(t);
  }, [paused, cards.length]);
  if (!cards.length) return null;
  const c = cards[i];
  const body = w.carousel(`${c.sticker.toFixed(1)}¢`, `${c.real.toFixed(1)}¢`, `$${c.over.toLocaleString("en-US")}`);
  return (
    <div className="mt-6 max-w-xl rounded-3xl bg-over-2 p-5 shadow-[var(--shadow-soft)]"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <p className="text-xs font-bold uppercase tracking-wide text-over">{w.foundInFine} · {c.trap}</p>
      <div key={c.id} className="fade-in" aria-live="polite">
        <p className="mt-2 text-lg font-bold leading-tight">{c.planName} <span className="text-sm font-semibold text-ink-2">· {tidy(c.provider)}</span></p>
        <p className="mt-1">
          {body[0]}<b className="num">{body[1]}</b>{body[2]}<b className="num text-over">{body[3]}</b>{body[4]}<b className="num">{body[5]}</b>{body[6]}
        </p>
        {c.why && <p className="mt-1 text-sm text-ink-2">{c.why}</p>}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <Link href={`/plan/${c.id}`} className="text-sm font-semibold underline underline-offset-4">{w.seeFinePrint}</Link>
        <div className="flex">
          {cards.map((x, j) => (
            // 24px tap area around a small dot
            <button key={x.id} type="button" onClick={() => setI(j)} aria-label={w.exampleOf(j + 1, cards.length)} aria-current={j === i}
              className="flex h-6 min-w-6 items-center justify-center px-0.5">
              <span className={`block h-2.5 rounded-full transition-all ${j === i ? "w-6 bg-over" : "w-2.5 bg-ink/20"}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
