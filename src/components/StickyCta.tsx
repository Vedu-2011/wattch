"use client";
import { useEffect, useState } from "react";

/** Phones only: while the usage picker is off screen, a button at the bottom brings you to it. */
export function StickyCta() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = document.getElementById("picker");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  if (!show) return null;
  function go() {
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("picker")?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
    setTimeout(() => (document.getElementById("kwh") as HTMLInputElement | null)?.focus({ preventScroll: true }), smooth ? 400 : 0);
  }
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:hidden">
      <button type="button" onClick={go} className="pop w-full rounded-full bg-volt py-3.5 text-lg font-bold text-ink shadow-[var(--shadow-lift)]">
        Find my best plan
      </button>
    </div>
  );
}
