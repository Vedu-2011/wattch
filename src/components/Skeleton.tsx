"use client";
import { Suspense } from "react";
import { Kapi } from "@/components/Kapi";
import { useUiLang } from "@/components/SiteChrome";

export const LOADING_WORDS = {
  en: { wall: "Getting every plan…", plan: "Opening the fine print…" },
  es: { wall: "Juntando todos los planes…", plan: "Abriendo la letra pequeña…" },
} as const;
type Kind = keyof (typeof LOADING_WORDS)["en"];

/** Loading placeholder: soft blocks in the page's shape, plus Kapi reading. */
export function SkeletonView({ label, blocks, lang = "en" }: { label: string; blocks: string[]; lang?: "en" | "es" }) {
  return (
    <div lang={lang} className="mx-auto max-w-6xl px-4 pt-6 sm:px-5" role="status" aria-live="polite">
      <div className="flex items-end gap-3">
        <Kapi reading className="h-14 w-14 shrink-0" />
        <p className="display text-3xl font-extrabold sm:text-4xl">{label}</p>
      </div>
      <div className="mt-6 space-y-4">
        {blocks.map((h, i) => <div key={i} className={`skeleton rounded-3xl bg-paper-2 ${h}`} />)}
      </div>
    </div>
  );
}

function ByUrl({ kind, blocks }: { kind: Kind; blocks: string[] }) {
  const lang = useUiLang();
  return <SkeletonView label={LOADING_WORDS[lang][kind]} blocks={blocks} lang={lang} />;
}

/** The loading text in the page's language (from ?lang=es in the URL). */
export function Skeleton({ kind, blocks }: { kind: Kind; blocks: string[] }) {
  return (
    <Suspense fallback={<SkeletonView label={LOADING_WORDS.en[kind]} blocks={blocks} />}>
      <ByUrl kind={kind} blocks={blocks} />
    </Suspense>
  );
}
