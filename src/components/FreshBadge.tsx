"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Fresh } from "@/components/Fresh";
import { useUiLang } from "@/components/SiteChrome";

export type BadgeCounts = { verified: number; total: number; builtAt: string };

/** "171 of 172 labels check out · read 2 hours ago" — counts follow ?area=, words follow the page's language. */
export function FreshBadge({ counts }: { counts: { houston: BadgeCounts; dallas: BadgeCounts } }) {
  const area = useSearchParams().get("area") === "dallas" ? "dallas" : "houston";
  return <Badge c={counts[area]} lang={useUiLang()} />;
}

/** Same badge without reading the URL (the fallback while the page streams, and for static pages). */
export function Badge({ c, lang = "en" }: { c: BadgeCounts; lang?: "en" | "es" }) {
  const es = lang === "es";
  return (
    <Link href="/how" lang={lang} className="inline-flex items-center gap-2 rounded-full bg-good-2 px-3 py-1 text-xs font-medium text-ink hover:brightness-95">
      <span aria-hidden className="h-2 w-2 rounded-full bg-good" />
      <span>
        <span className="num">{c.verified}</span> {es ? "de" : "of"} <span className="num">{c.total}</span> {es ? "etiquetas cuadran" : "labels check out"} ·{" "}
        <Fresh at={c.builtAt} prefix={es ? "leídas" : "read"} lang={lang} />
      </span>
    </Link>
  );
}
