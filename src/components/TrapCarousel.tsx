"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { TrapCard } from "@/lib/hero";

const tidy = (s: string) => s.replace(/\b(LLC|INC|LP|L\.P\.|CO)\b\.?/gi, "").replace(/\(TX\)/gi, "").replace(/\s+/g, " ").trim()
  .toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

/** One real trap at a time, every 5 seconds. Pauses on hover/focus; no auto-advance with reduced motion. */
export function TrapCarousel({ cards }: { cards: TrapCard[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || cards.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % cards.length), 5000);
    return () => clearInterval(t);
  }, [paused, cards.length]);
  if (!cards.length) return null;
  const c = cards[i];
  return (
    <div className="mt-6 max-w-xl rounded-3xl bg-over-2 p-5 shadow-[var(--shadow-soft)]"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <p className="text-xs font-bold uppercase tracking-wide text-over">Found in the fine print · {c.trap}</p>
      <div key={c.id} className="fade-in" aria-live="polite">
        <p className="mt-2 text-lg font-bold leading-tight">{c.planName} <span className="text-sm font-semibold text-ink-2">· {tidy(c.provider)}</span></p>
        <p className="mt-1">
          Advertised <b className="num">{c.sticker.toFixed(1)}¢</b>. Using 1,100 kWh a month through a Houston year, you&apos;d really pay{" "}
          <b className="num text-over">{c.real.toFixed(1)}¢</b> — <b className="num">${c.over.toLocaleString()}</b> more a year.
        </p>
        {c.why && <p className="mt-1 text-sm text-ink-2">{c.why}</p>}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <Link href={`/plan/${c.id}`} className="text-sm font-semibold underline underline-offset-4">See the fine print</Link>
        <div className="flex">
          {cards.map((x, j) => (
            // 24px tap area around a small dot
            <button key={x.id} type="button" onClick={() => setI(j)} aria-label={`Example ${j + 1} of ${cards.length}`} aria-current={j === i}
              className="flex h-6 min-w-6 items-center justify-center px-0.5">
              <span className={`block h-2.5 rounded-full transition-all ${j === i ? "w-6 bg-over" : "w-2.5 bg-ink/20"}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
