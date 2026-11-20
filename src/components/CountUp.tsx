"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Counts from the last value shown to the new one (from 0 the first time). Screen readers get the final number only.
 * With reduced motion it just shows the number.
 */
export function CountUp({ value, format, ms = 1100 }: { value: number; format: (n: number) => string; ms?: number }) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const start = from.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || start === value) {
      from.current = value;
      const raf = requestAnimationFrame(() => setShown(value));
      return () => cancelAnimationFrame(raf);
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = () => {
      const t = Math.min(1, (performance.now() - t0) / ms);
      const eased = 1 - (1 - t) ** 3;
      const n = start + (value - start) * eased;
      from.current = n;
      setShown(n);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return (
    <>
      <span aria-hidden>{format(shown)}</span>
      <span className="sr-only">{format(value)}</span>
    </>
  );
}
