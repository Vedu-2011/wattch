"use client";
import { useState } from "react";
import { type Lang, words } from "@/lib/i18n";
import { RESULT_KEYS } from "@/lib/params";

/** Keeps only the params a result depends on, so a shared link (and its card) shows exactly this result. */
function resultQuery(): string {
  const now = new URLSearchParams(window.location.search);
  const q = new URLSearchParams();
  for (const k of RESULT_KEYS) { const v = now.get(k); if (v) q.set(k, v); }
  return q.toString();
}

/** Shares this exact result. The link unfurls into the share card (/api/card) built from the same math. */
export function ShareButton({ text, lang = "en" }: { text: string; lang?: Lang }) {
  const w = words(lang);
  const [msg, setMsg] = useState<string | null>(null);
  async function share() {
    const url = `${window.location.origin}/wall?${resultQuery()}`;
    try {
      if (navigator.share) { await navigator.share({ title: "Wattch", text, url }); return; }
      await navigator.clipboard.writeText(`${text} ${url}`);
      setMsg(w.linkCopied);
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      setMsg(w.shareFailed);
    }
    setTimeout(() => setMsg(null), 2500);
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button type="button" onClick={share} className="rounded-full bg-paper px-5 py-2.5 font-bold text-ink">{w.shareMine}</button>
      <button type="button" onClick={() => window.open(`/api/card?${resultQuery()}`, "_blank", "noopener")}
        className="rounded-full px-3 py-2.5 text-sm font-semibold text-paper/80 underline-offset-4 hover:underline">
        {w.shareCard}
      </button>
      {msg && <span role="status" className="text-sm text-volt">{msg}</span>}
    </span>
  );
}
