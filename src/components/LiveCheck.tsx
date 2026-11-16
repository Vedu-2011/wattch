"use client";
import { useState } from "react";
import type { Lang } from "@/lib/i18n";
import { timeAgo } from "@/lib/timeAgo";

type Live = { ok: true; via: "direct" | "anakin"; ms: number; same: boolean; pricesSame: boolean; readAt: string } | { ok: false; message: string };

const T = {
  en: {
    offline: "Couldn't reach the provider's site right now. Try again in a minute.",
    busy: "Opening the label…",
    go: "Check this label again now",
    same: (ago: string, s: string) => `✓ Same label, word for word, as when Wattch read it ${ago}. Opened in ${s}s.`,
    newFile: "✓ The file is new (often just a new print date), but it still prints the same 3 prices we checked.",
    changed: (ago: string) => `This label changed since Wattch read it ${ago}. The numbers here may be out of date until the next read.`,
    failed: (m: string) => m,
  },
  es: {
    offline: "No pudimos abrir el sitio del proveedor ahora. Intenta de nuevo en un minuto.",
    busy: "Abriendo la etiqueta…",
    go: "Revisar esta etiqueta otra vez ahora",
    same: (ago: string, s: string) => `✓ La misma etiqueta, palabra por palabra, que Wattch leyó (${ago}). Se abrió en ${s} s.`,
    newFile: "✓ El archivo es nuevo (muchas veces solo cambia la fecha), pero sigue mostrando los mismos 3 precios que revisamos.",
    changed: (ago: string) => `Esta etiqueta cambió desde que Wattch la leyó (${ago}). Los números aquí pueden estar viejos hasta la próxima lectura.`,
    failed: () => "No pudimos abrir la etiqueta del proveedor ahora. Intenta de nuevo en un minuto.",
  },
} as const;

/** Opens the provider's label again, right now, and says in plain words whether it still says what we read. */
export function LiveCheck({ id, lang = "en" }: { id: string; lang?: Lang }) {
  const t = T[lang];
  const [state, setState] = useState<"idle" | "busy" | Live>("idle");
  async function run() {
    setState("busy");
    try {
      const r = await fetch(`/api/live?id=${encodeURIComponent(id)}`, { cache: "no-store" });
      setState((await r.json()) as Live);
    } catch {
      setState({ ok: false, message: t.offline });
    }
  }
  const res = typeof state === "object" ? state : null;
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={run}
        disabled={state === "busy"}
        className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt disabled:opacity-60"
      >
        {state === "busy" ? t.busy : t.go}
      </button>
      <div aria-live="polite" className="mt-2 text-sm [&>span]:block [&>span]:rounded-2xl [&>span]:px-3 [&>span]:py-2">
        {res && res.ok && res.same && <span className="rounded-xl bg-good-2 px-2 py-1">{t.same(timeAgo(res.readAt, undefined, lang), (res.ms / 1000).toFixed(1))}</span>}
        {res && res.ok && !res.same && res.pricesSame && <span className="rounded-xl bg-good-2 px-2 py-1">{t.newFile}</span>}
        {res && res.ok && !res.same && !res.pricesSame && <span className="rounded-xl bg-volt-2 px-2 py-1">{t.changed(timeAgo(res.readAt, undefined, lang))}</span>}
        {res && !res.ok && <span className="rounded-xl bg-volt-2 px-2 py-1">{t.failed(res.message)}</span>}
      </div>
    </div>
  );
}
