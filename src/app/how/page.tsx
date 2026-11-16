import type { Metadata } from "next";
import { cardUrl, langPair, shareMeta } from "@/lib/alternates";
import { Kapi } from "@/components/Kapi";
import { Pipeline } from "@/components/Pipeline";
import { HOW_WORDS } from "@/lib/howWords";
import { asLang } from "@/lib/i18n";
import { areaInfo, pipelineCounts } from "@/lib/plans/data";
import { AREAS } from "@/lib/plans/ptc";

/** "claude-haiku-5-5" → "Claude Haiku" */
const niceModel = (m: string) => m.split("-").filter((w) => !/^\d/.test(w)).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export async function generateMetadata({ searchParams }: PageProps<"/how">): Promise<Metadata> {
  const sp = await searchParams;
  const t = HOW_WORDS[asLang(one(sp.lang))];
  return { title: t.title, description: t.desc, alternates: langPair("/how", sp), ...shareMeta(cardUrl(sp)) };
}
/** Reads ?lang= from the URL, so it renders per request. */
export const instant = false;

export default async function How({ searchParams }: PageProps<"/how">) {
  const lang = asLang(one((await searchParams).lang));
  const t = HOW_WORDS[lang];
  const areas = ["houston", "dallas"] as const;
  return (
    <div lang={lang} className="mx-auto max-w-3xl px-5 pt-8">
      <h1 className="display text-4xl font-extrabold">{t.h1}</h1>
      <p className="mt-2 text-lg text-ink-2">{t.motto}</p>
      <div className="mt-6 space-y-4">
        {areas.map((a) => (
          <Pipeline key={a} c={pipelineCounts(a)} city={AREAS[a].city} model={niceModel(areaInfo(a).model)} lang={lang} />
        ))}
      </div>
      <ol className="mt-8 space-y-4">
        {t.steps.map((s, i) => (
          <li key={s.t} className="flex gap-4 rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
            <span className="display flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-volt text-lg font-extrabold">{i + 1}</span>
            <div><h2 className="text-lg font-bold">{s.t}</h2><p className="mt-1 text-ink-2">{s.d}</p></div>
          </li>
        ))}
      </ol>
      <div className="mt-8 flex items-center gap-4 rounded-3xl bg-good-2 p-5">
        <Kapi reading className="h-14 w-14 shrink-0" />
        <div className="space-y-1">
          {areas.map((a) => {
            const i = areaInfo(a);
            const when = new Date(i.builtAt).toLocaleString(lang === "es" ? "es-US" : "en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Chicago" }) + " CT";
            return <p key={a}>{t.last(AREAS[a].city, when, i.counts.verified ?? 0, i.total, i.counts.mismatch ?? 0, i.counts.unread ?? 0)}</p>;
          })}
          <p>{t.reader(areaInfo("houston").model)}</p>
        </div>
      </div>
    </div>
  );
}
