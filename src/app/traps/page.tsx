import type { Metadata } from "next";
import { cardUrl, langPair, shareMeta } from "@/lib/alternates";
import Link from "next/link";
import { asLang } from "@/lib/i18n";
import { clientPlans } from "@/lib/plans/data";
import { AREAS, asArea } from "@/lib/plans/ptc";
import { trapGuide } from "@/lib/trapGuide";
import { TRAPS_WORDS, TRAP_KINDS_ES } from "@/lib/trapsWords";

/** Reads ?area= and ?lang= from the URL, so it renders per request. */
export const instant = false;

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const areaFrom = (sp: SP) => asArea(one(sp.area));

export async function generateMetadata({ searchParams }: PageProps<"/traps">): Promise<Metadata> {
  const sp = await searchParams;
  const city = AREAS[areaFrom(sp)].city;
  const t = TRAPS_WORDS[asLang(one(sp.lang))];
  return { title: t.title(city), description: t.desc(city), alternates: langPair("/traps", sp), ...shareMeta(cardUrl(sp)) };
}

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const tidy = (s: string) => s.replace(/\b(LLC|INC|LP|L\.P\.|CO)\b\.?/gi, "").replace(/\(TX\)/gi, "").replace(/\s+/g, " ").trim()
  .toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export default async function Traps({ searchParams }: PageProps<"/traps">) {
  const sp = await searchParams;
  const area = areaFrom(sp);
  const lang = asLang(one(sp.lang));
  const es = lang === "es";
  const t = TRAPS_WORDS[lang];
  const { city } = AREAS[area];
  const guide = trapGuide(clientPlans(area), area).map((e) => (es && TRAP_KINDS_ES[e.key] ? { ...e, ...TRAP_KINDS_ES[e.key] } : e));
  const q = `${area === "dallas" ? "&area=dallas" : ""}${es ? "&lang=es" : ""}`;
  const switchHref = (a: "houston" | "dallas") => {
    const s = [a === "dallas" ? "area=dallas" : "", es ? "lang=es" : ""].filter(Boolean).join("&");
    return `/traps${s ? `?${s}` : ""}`;
  };
  return (
    <div lang={lang} className="mx-auto max-w-4xl px-5 pt-8">
      <h1 className="display text-4xl font-extrabold leading-tight sm:text-5xl">{t.h1}</h1>
      <div role="group" aria-label={t.area} className="mt-4 flex flex-wrap gap-2">
        {(["houston", "dallas"] as const).map((a) => (
          <Link key={a} href={switchHref(a)} aria-current={a === area ? "page" : undefined}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${a === area ? "bg-ink text-paper" : "bg-paper-2 hover:bg-volt-2"}`}>
            {AREAS[a].city} ({AREAS[a].utility})
          </Link>
        ))}
      </div>
      <p className="mt-3 max-w-2xl text-ink-2">{t.intro(city)}</p>
      <nav aria-label={t.kinds} className="mt-5 flex flex-wrap gap-2">
        {guide.map((e) => (
          <a key={e.key} href={`#${e.key}`} className="rounded-full bg-card px-3 py-1.5 text-sm font-semibold shadow-[var(--shadow-soft)] hover:bg-volt-2">
            {e.name} <span className="num text-ink-2">· {e.count}</span>
          </a>
        ))}
      </nav>

      <div className="mt-8 space-y-5">
        {guide.map((e) => (
          <section key={e.key} id={e.key} className="scroll-mt-6 rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="display text-2xl font-extrabold">{e.name}</h2>
              <p className="num text-sm font-semibold text-ink-2">{t.count(e.count)}</p>
            </div>
            <p className="mt-2">{e.what}</p>
            <p className="mt-1 font-medium text-over">{e.bite}</p>
            {e.example ? (
              <div className="mt-4 rounded-2xl bg-paper p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-ink-2">{t.example}</p>
                <p className="mt-1 text-lg font-bold leading-tight">
                  {e.example.planName} <span className="text-sm font-semibold text-ink-2">· {tidy(e.example.provider)} · {t.sticker(`${e.example.sticker.toFixed(1)}¢`)}</span>
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {e.example.at.map((a) => (
                    <Link key={a.kwh} href={`/plan/${e.example!.id}?kwh=${a.kwh}${q}`} className="rounded-xl bg-card px-3 py-2.5 hover:bg-volt-2">
                      <p className="num text-xs text-ink-2">{t.perMonth(a.kwh.toLocaleString("en-US"))}</p>
                      <p className="num text-xl font-semibold">{money(a.annual)}<span className="text-xs text-ink-2">{t.perYr}</span></p>
                      <p className="text-xs">
                        {a.extra >= 1
                          ? <><b className="num text-over">{money(a.extra)}</b> {t.more} · {t.rank(a.rank, a.of)}</>
                          : <><b className="text-good">{t.best}</b> {t.forHome}</>}
                      </p>
                    </Link>
                  ))}
                </div>
                <Link href={`/plan/${e.example.id}?kwh=1100${q}`} className="mt-3 inline-block text-sm font-semibold underline underline-offset-4">{t.read}</Link>
              </div>
            ) : (
              <p className="mt-4 text-sm text-ink-2">{t.none}</p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
