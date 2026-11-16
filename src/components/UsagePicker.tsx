"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type Lang, words } from "@/lib/i18n";
import { TEXAS_AVG_KWH } from "@/lib/seasons";

const PRESET_KWH = [600, 1100, 2100];

export function UsagePicker({ initial = 1100, lang = "en" }: { initial?: number; lang?: Lang }) {
  const w = words(lang);
  const router = useRouter();
  const [kwh, setKwh] = useState(String(initial));
  const n = Math.round(Number(kwh));
  const valid = Number.isFinite(n) && n >= 100 && n <= 5000;
  return (
    <form id="picker"
      className="scroll-mt-24 rounded-3xl bg-card p-5 sm:p-6 shadow-[var(--shadow-lift)]"
      onSubmit={(e) => { e.preventDefault(); if (valid) router.push(`/wall?kwh=${n}${lang === "es" ? "&lang=es" : ""}`); }}
    >
      <label htmlFor="kwh" className="block text-base font-semibold">{w.pickerQ}</label>
      <p className="mt-1 text-sm text-ink-2">{w.pickerHint(TEXAS_AVG_KWH)}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {PRESET_KWH.map((p, i) => (
          <button type="button" key={p} onClick={() => setKwh(String(p))}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${n === p ? "bg-ink text-paper" : "bg-paper-2 hover:bg-volt-2"}`}>
            {w.presets[i]} <span className="num opacity-70">· {p.toLocaleString("en-US")}</span>
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
          {w.readEvery}
        </button>
      </div>
      {!valid && kwh !== "" && <p className="mt-2 text-sm text-over">{w.pickerBad}</p>}
    </form>
  );
}
