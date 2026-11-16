import { Suspense } from "react";
import { type AreaHero, HomeHero, HomeHeroFromUrl } from "@/components/HomeHero";
import { StickyCta } from "@/components/StickyCta";
import { HEADLINE_KWH } from "@/lib/headline";
import { heroStats } from "@/lib/hero";
import { type Lang, words } from "@/lib/i18n";
import { areaInfo, clientPlans } from "@/lib/plans/data";
import type { Area } from "@/lib/plans/ptc";

/** The home page in English (/) or Spanish (/es). Numbers for both areas come from the data files; Houston shows first. */
export function HomeView({ lang }: { lang: Lang }) {
  const w = words(lang);
  const heroFor = (area: Area): AreaHero => {
    const info = areaInfo(area);
    const hero = heroStats(clientPlans(area), HEADLINE_KWH, 5, lang, area);
    return {
      total: info.total, read: hero.read, verified: info.counts.verified ?? 0, withTrap: hero.withTrap, cards: hero.cards,
      date: new Date(info.builtAt).toLocaleDateString(lang === "es" ? "es-US" : "en-US", { month: "short", day: "numeric", timeZone: "America/Chicago" }), // Texas date, not the server's
    };
  };
  const heroes = { houston: heroFor("houston"), dallas: heroFor("dallas") };
  return (
    <div lang={lang} className="mx-auto max-w-6xl px-5 pt-10 sm:pt-16">
      <Suspense fallback={<HomeHero lang={lang} heroes={heroes} />}><HomeHeroFromUrl lang={lang} heroes={heroes} /></Suspense>
      <StickyCta label={w.stickyCta} />
    </div>
  );
}
