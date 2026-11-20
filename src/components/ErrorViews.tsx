"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Kapi } from "@/components/Kapi";
import { useUiLang } from "@/components/SiteChrome";

export const ERROR_WORDS = {
  en: {
    nfTitle: "Kapi couldn't find that page.",
    nfBody: "The link may be old, or that plan isn't on Power to Choose anymore. Plans come and go every week.",
    every: "See every plan", home: "Home",
    errTitle: "Something went wrong on our side.",
    errBody: "Your numbers are fine — this page just didn't load. Try again, or start over.",
    retry: "Try again",
  },
  es: {
    nfTitle: "Kapi no encontró esa página.",
    nfBody: "Puede que el enlace sea viejo, o que ese plan ya no esté en Power to Choose. Los planes cambian cada semana.",
    every: "Ver todos los planes", home: "Inicio",
    errTitle: "Algo falló de nuestro lado.",
    errBody: "Tus números están bien; esta página no cargó. Intenta otra vez o empieza de nuevo.",
    retry: "Intentar otra vez",
  },
} as const;

const btn = "rounded-full px-5 py-2.5 font-bold";

export function NotFoundView({ lang, area = "houston" }: { lang: "en" | "es"; area?: "houston" | "dallas" }) {
  const t = ERROR_WORDS[lang];
  const es = lang === "es";
  // keep the visitor in their city: a Dallas link that went nowhere should lead back to Dallas plans
  const dal = area === "dallas";
  const wall = `/wall?kwh=1100${dal ? "&area=dallas" : ""}${es ? "&lang=es" : ""}`;
  const home = `${es ? "/es" : "/"}${dal ? "?area=dallas" : ""}`;
  return (
    <div lang={lang} className="mx-auto flex max-w-2xl flex-col items-center px-5 pt-16 text-center sm:pt-24">
      <Kapi reading className="h-28 w-28" />
      <h1 className="display mt-6 text-4xl font-extrabold leading-tight sm:text-5xl">{t.nfTitle}</h1>
      <p className="mt-3 text-lg text-ink-2">{t.nfBody}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href={wall} className={`${btn} bg-ink text-paper`}>{t.every}</Link>
        <Link href={home} className={`${btn} bg-card shadow-[var(--shadow-soft)]`}>{t.home}</Link>
      </div>
    </div>
  );
}
export const NotFoundByUrl = () => <NotFoundView lang={useUiLang()} area={useSearchParams().get("area") === "dallas" ? "dallas" : "houston"} />;

/** Something broke while showing a page. Never show a stack trace; offer a retry and a way home. */
export function ErrorView({ reset }: { reset: () => void }) {
  const lang = useUiLang();
  const t = ERROR_WORDS[lang];
  return (
    <div lang={lang} className="mx-auto flex max-w-2xl flex-col items-center px-5 pt-16 text-center sm:pt-24">
      <Kapi pose="thinking" className="h-28 w-28" />
      <h1 className="display mt-6 text-4xl font-extrabold leading-tight sm:text-5xl">{t.errTitle}</h1>
      <p className="mt-3 text-lg text-ink-2">{t.errBody}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={reset} className={`${btn} bg-ink text-paper`}>{t.retry}</button>
        <Link href={lang === "es" ? "/es" : "/"} className={`${btn} bg-card shadow-[var(--shadow-soft)]`}>{t.home}</Link>
      </div>
    </div>
  );
}
