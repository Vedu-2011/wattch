import type { Metadata } from "next";
import { asLang } from "@/lib/i18n";
import { SOURCE_LINKS, SOURCES_WORDS } from "@/lib/sourcesWords";

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export async function generateMetadata({ searchParams }: PageProps<"/sources">): Promise<Metadata> {
  const t = SOURCES_WORDS[asLang(one((await searchParams).lang))];
  return { title: t.title, description: t.desc };
}
/** Reads ?lang= from the URL, so it renders per request. */
export const instant = false;

export default async function Sources({ searchParams }: PageProps<"/sources">) {
  const lang = asLang(one((await searchParams).lang));
  const t = SOURCES_WORDS[lang];
  return (
    <div lang={lang} className="mx-auto max-w-3xl px-5 pt-8">
      <h1 className="display text-4xl font-extrabold">{t.h1}</h1>
      <p className="mt-2 text-ink-2">{t.intro}</p>
      <ul className="mt-6 space-y-3">
        {SOURCE_LINKS.map((s, i) => (
          <li key={s.name} className="rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
            <h2 lang="en" className="font-bold">{s.url ? <a className="underline decoration-volt decoration-2 underline-offset-4" href={s.url} target="_blank" rel="noreferrer">{s.name}</a> : s.name}</h2>
            <p className="text-sm text-ink-2">{t.items[i].by}</p>
            <p className="mt-1">{t.items[i].use}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
