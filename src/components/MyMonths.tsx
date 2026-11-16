"use client";
import { useState } from "react";
import { MONTHS_BY_LANG } from "@/lib/i18n";
import { parseMonths } from "@/lib/months";
import { MYMONTHS_WORDS } from "@/lib/wallToolsWords";

/** Type (or paste) your real 12 months from your bill's usage history. Starts filled with the current guess. */
export function MyMonths({ start, active, onUse, onClear, lang = "en" }: { start: number[]; active: boolean; onUse: (m: number[]) => void; onClear: () => void; lang?: "en" | "es" }) {
  const t = MYMONTHS_WORDS[lang];
  const M = MONTHS_BY_LANG[lang];
  const [open, setOpen] = useState(false);
  const [vals, setVals] = useState<string[]>(() => start.map(String));
  const [paste, setPaste] = useState("");
  const [err, setErr] = useState<string | null>(null);

  function use(text: string) {
    const r = parseMonths(text, lang);
    if ("error" in r) { setErr(r.error); return; }
    setErr(null);
    setVals(r.months.map(String));
    setPaste("");
    setOpen(false);
    onUse(r.months);
  }

  if (!open) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => { setVals(start.map(String)); setOpen(true); }}
          className="rounded-full bg-paper px-4 py-2 text-sm font-semibold hover:bg-volt-2 focus-visible:outline-2 focus-visible:outline-volt">
          {active ? t.edit : t.use}
        </button>
        {active && <button type="button" onClick={onClear} className="text-sm font-medium underline underline-offset-4">{t.back}</button>}
      </div>
    );
  }
  return (
    <div className="rounded-2xl bg-paper p-4">
      <p className="text-sm font-semibold">{t.title}</p>
      <p className="text-xs text-ink-2">{t.hint}</p>
      <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
        {M.map((m, i) => (
          <label key={m} className="text-xs font-medium text-ink-2">
            {m}
            <input inputMode="numeric" value={vals[i]} aria-label={t.kwh(m)}
              onChange={(e) => setVals((v) => v.map((x, j) => (j === i ? e.target.value.replace(/[^\d]/g, "") : x)))}
              className="num mt-1 block w-full rounded-lg bg-card px-2 py-1.5 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-volt" />
          </label>
        ))}
      </div>
      <label className="mt-3 block text-xs font-medium text-ink-2">
        {t.paste}
        <textarea value={paste} onChange={(e) => setPaste(e.target.value)} rows={2} placeholder="820 700 760 880 1250 1560 1700 1850 1400 1100 780 760"
          className="num mt-1 block w-full rounded-lg bg-card px-2 py-1.5 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-volt" />
      </label>
      {err && <p role="alert" className="mt-2 rounded-xl bg-over-2 px-3 py-2 text-sm text-over">{err}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => use(paste.trim() ? paste : vals.join(" "))} className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper">{t.go}</button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-full px-4 py-2 text-sm font-medium">{t.close}</button>
      </div>
    </div>
  );
}
