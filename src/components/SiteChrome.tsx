"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

type L = "en" | "es";

/** The page's language from the URL: /es, or ?lang=es on any page that has Spanish. */
export function useUiLang(): L {
  const path = usePathname();
  const sp = useSearchParams();
  return path === "/es" || path.startsWith("/es/") || sp.get("lang") === "es" ? "es" : "en";
}

export const NAV = {
  en: { skip: "Skip to the content", traps: "Traps", howShort: "How", how: "How it works", sources: "Sources" },
  es: { skip: "Saltar al contenido", traps: "Trampas", howShort: "Cómo", how: "Cómo funciona", sources: "Fuentes" },
} as const;

const item = "rounded-full px-1.5 py-1.5 hover:bg-paper-2 sm:px-3";

/** Header links in one language (also the English fallback while the page streams). */
export function NavView({ lang }: { lang: L }) {
  const t = NAV[lang];
  return (
    <nav lang={lang} className="flex gap-0 whitespace-nowrap text-[0.8125rem] font-medium sm:gap-1 sm:text-sm">
      <Link className={item} href={lang === "es" ? "/traps?lang=es" : "/traps"}>{t.traps}</Link>
      <Link className={item} href={lang === "es" ? "/how?lang=es" : "/how"}><span className="sm:hidden">{t.howShort}</span><span className="hidden sm:inline">{t.how}</span></Link>
      <Link className={item} href={lang === "es" ? "/sources?lang=es" : "/sources"}>{t.sources}</Link>
    </nav>
  );
}
const esPath = (path: string) => path === "/es" || path.startsWith("/es/");
/** Reads ?lang= (needs a Suspense boundary; on a static page it waits for the browser). */
const NavByQuery = () => <NavView lang={useUiLang()} />;
/** On /es the path alone says Spanish, so even the static Spanish home ships Spanish links in its HTML. */
export const Nav = () => (esPath(usePathname()) ? <NavView lang="es" /> : <NavByQuery />);

export const FOOT = {
  en: "Wattch shows the math. Always open the plan's fine print before you switch. Prices before taxes. Plan list from the state's Power to Choose site.",
  es: "Wattch muestra las cuentas. Siempre abre la letra pequeña del plan antes de cambiarte. Precios antes de impuestos. Lista de planes del sitio Power to Choose del estado.",
} as const;

export const FooterView = ({ lang }: { lang: L }) => <span lang={lang}>{FOOT[lang]}</span>;
const FooterByQuery = () => <FooterView lang={useUiLang()} />;
export const Footer = () => (esPath(usePathname()) ? <FooterView lang="es" /> : <FooterByQuery />);

/** Sets <html lang> to the page's language after load (the root layout is shared, so it ships as "en"). */
export function HtmlLang() {
  const lang = useUiLang();
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  return null;
}

/** First thing a keyboard reaches: jumps past the header to the page itself (hidden until focused). */
export const SkipView = ({ lang }: { lang: L }) => (
  <a href="#main" lang={lang} className="no-print sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-paper">
    {NAV[lang].skip}
  </a>
);
const SkipByQuery = () => <SkipView lang={useUiLang()} />;
export const SkipLink = () => (esPath(usePathname()) ? <SkipView lang="es" /> : <SkipByQuery />);
