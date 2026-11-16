import { Kapi } from "@/components/Kapi";
import { UsagePicker } from "@/components/UsagePicker";
import { StickyCta } from "@/components/StickyCta";
import { TrapCarousel } from "@/components/TrapCarousel";
import { HEADLINE_KWH } from "@/lib/headline";
import { heroStats } from "@/lib/hero";
import { type Lang, words } from "@/lib/i18n";
import { clientPlans, snapshotInfo } from "@/lib/plans/data";

/** The home page in English (/) or Spanish (/es). Same numbers, from data/plans.json. */
export function HomeView({ lang }: { lang: Lang }) {
  const w = words(lang);
  const verified = snapshotInfo.counts.verified ?? 0;
  const hero = heroStats(clientPlans(), HEADLINE_KWH, 5, lang);
  const date = new Date(snapshotInfo.builtAt).toLocaleDateString(lang === "es" ? "es-US" : "en-US", { month: "short", day: "numeric" });
  return (
    <div lang={lang} className="mx-auto max-w-6xl px-5 pt-10 sm:pt-16">
      <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-volt-2 px-3 py-1 text-sm font-semibold">
            <span className="h-2 w-2 rounded-full bg-good" /> {w.badge(snapshotInfo.total, date)}
          </p>
          <h1 className="display mt-5 text-[2.6rem] font-extrabold leading-[0.95] sm:text-7xl">{w.heroTitle}</h1>
          <p className="mt-5 max-w-xl text-base text-ink-2 sm:text-lg">{w.heroBody}</p>
          <dl className="mt-6 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <Stat n={hero.read} label={w.statRead} />
            <Stat n={verified} label={w.statChecked} />
            <Stat n={hero.withTrap} label={w.statTrap} hot />
          </dl>
          <TrapCarousel cards={hero.cards} lang={lang} />
        </div>
        <div className="relative">
          <Kapi reading className="absolute -top-16 right-3 z-10 h-20 w-20 drop-shadow-md sm:-top-20 sm:h-24 sm:w-24" />
          <UsagePicker lang={lang} />
        </div>
      </div>
      <StickyCta label={w.stickyCta} />
    </div>
  );
}

function Stat({ n, label, hot = false }: { n: number; label: string; hot?: boolean }) {
  return (
    <div className={`rounded-2xl px-3 py-3 sm:px-4 ${hot ? "bg-ink text-paper" : "bg-card shadow-[var(--shadow-soft)]"}`}>
      <dt className="sr-only">{label}</dt>
      <dd className={`num text-2xl font-semibold sm:text-3xl leading-none ${hot ? "text-volt" : ""}`}>{n}</dd>
      <dd className={`mt-1 text-xs font-medium ${hot ? "text-paper/70" : "text-ink-2"}`}>{label}</dd>
    </div>
  );
}
