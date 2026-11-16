"use client";
import { useState } from "react";

/** Shares this exact result. The link unfurls into the share card (/api/card) built from the same math. */
export function ShareButton({ kwh, text, flat = false }: { kwh: number; text: string; flat?: boolean }) {
  const [msg, setMsg] = useState<string | null>(null);
  const path = `/wall?kwh=${kwh}${flat ? "&flat=1" : ""}`;
  async function share() {
    const url = `${window.location.origin}${path}`;
    try {
      if (navigator.share) { await navigator.share({ title: "Wattch", text, url }); return; }
      await navigator.clipboard.writeText(`${text} ${url}`);
      setMsg("Link copied");
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      setMsg("Couldn't share — copy the address bar instead");
    }
    setTimeout(() => setMsg(null), 2500);
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button type="button" onClick={share} className="rounded-full bg-paper px-5 py-2.5 font-bold text-ink">Share my result</button>
      <a href={`/api/card?kwh=${kwh}${flat ? "&flat=1" : ""}`} target="_blank" rel="noreferrer" className="rounded-full px-3 py-2.5 text-sm font-semibold text-paper/80 underline-offset-4 hover:underline">
        Share card
      </a>
      {msg && <span role="status" className="text-sm text-volt">{msg}</span>}
    </span>
  );
}
