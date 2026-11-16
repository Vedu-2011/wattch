"use client";
import { useState } from "react";
import { type Lang, words } from "@/lib/i18n";

/** Shares this page's own link (plan or compare). The link previews as that page's card (/api/card?plan= or ?a=&b=). */
export function ShareLink({ title, lang = "en" }: { title: string; lang?: Lang }) {
  const w = words(lang);
  const [msg, setMsg] = useState<string | null>(null);
  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title, url }); return; }
      await navigator.clipboard.writeText(url);
      setMsg(w.linkCopied);
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      setMsg(w.shareFailed);
    }
    setTimeout(() => setMsg(null), 2500);
  }
  return (
    <>
      {/* the button itself says "Link copied" for a moment, so nothing new squeezes the row on small phones */}
      <button type="button" onClick={share} className="whitespace-nowrap rounded-full bg-paper-2 px-3 py-1.5 text-sm font-medium hover:bg-volt-2">
        {msg ?? (lang === "es" ? "Compartir" : "Share")}
      </button>
      <span role="status" className="sr-only">{msg ?? ""}</span>
    </>
  );
}
