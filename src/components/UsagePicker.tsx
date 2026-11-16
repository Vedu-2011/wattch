"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TEXAS_AVG_KWH } from "@/lib/seasons";

const PRESETS = [
  { label: "Small apartment", kwh: 600 },
  { label: "Average home", kwh: 1100 },
  { label: "Big house, hot summer", kwh: 2100 },
];

export function UsagePicker({ initial = 1100 }: { initial?: number }) {
  const router = useRouter();
  const [kwh, setKwh] = useState(String(initial));
  const n = Math.round(Number(kwh));
  const valid = Number.isFinite(n) && n >= 100 && n <= 5000;
  return (
    <form
      className="rounded-3xl bg-card p-5 sm:p-6 shadow-[var(--shadow-lift)]"
      onSubmit={(e) => { e.preventDefault(); if (valid) router.push(`/wall?kwh=${n}`); }}
    >
      <label htmlFor="kwh" className="block text-base font-semibold">How much power do you use in a month?</label>
      <p className="mt-1 text-sm text-ink-2">
        It&apos;s on your bill as &ldquo;kWh used.&rdquo; Not sure? The average Texas home uses about{" "}
        <span className="num">{TEXAS_AVG_KWH.toLocaleString()}</span> kWh a month.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button type="button" key={p.kwh} onClick={() => setKwh(String(p.kwh))}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${n === p.kwh ? "bg-ink text-paper" : "bg-paper-2 hover:bg-volt-2"}`}>
            {p.label} <span className="num opacity-70">· {p.kwh.toLocaleString()}</span>
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-col items-stretch gap-3 sm:flex-row">
        <div className="flex min-w-0 flex-1 items-center rounded-2xl bg-paper px-4">
          <input id="kwh" inputMode="numeric" value={kwh} onChange={(e) => setKwh(e.target.value.replace(/[^0-9]/g, ""))}
            className="num w-full min-w-0 bg-transparent py-3 text-2xl font-semibold outline-none" aria-describedby="kwh-unit" />
          <span id="kwh-unit" className="text-ink-2">kWh</span>
        </div>
        <button disabled={!valid} className="rounded-2xl bg-volt px-5 py-3.5 text-base font-bold text-ink shadow-[var(--shadow-soft)] transition hover:brightness-95 disabled:opacity-40">
          Read every plan
        </button>
      </div>
      {!valid && kwh !== "" && <p className="mt-2 text-sm text-over">Pick a number between 100 and 5,000.</p>}
    </form>
  );
}
