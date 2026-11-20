"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

/**
 * "Español" / "English" in the header, on every page that has Spanish.
 * Home is / and /es (known from the path, so it's in the static HTML); the others keep every setting and flip ?lang=es.
 */
export function LangSwitch() {
  const path = usePathname();
  if (path === "/" || path === "/es") {
    const es = path === "/es";
    // a plain link first; once the browser can read the query it keeps ?area=dallas too
    return <Suspense fallback={<SwitchLink href={es ? "/" : "/es"} es={es} />}><HomeKeepsQuery es={es} /></Suspense>;
  }
  return <PageByQuery path={path} />;
}

const PAGES = ["/wall", "/remind", "/compare", "/traps", "/how", "/sources"];

function HomeKeepsQuery({ es }: { es: boolean }) {
  const q = useSearchParams().toString();
  return <SwitchLink href={`${es ? "/" : "/es"}${q ? `?${q}` : ""}`} es={es} />;
}

function PageByQuery({ path }: { path: string }) {
  const sp = useSearchParams();
  if (!PAGES.includes(path) && !path.startsWith("/plan/")) return null;
  const es = sp.get("lang") === "es";
  const q = new URLSearchParams(sp.toString());
  if (es) q.delete("lang"); else q.set("lang", "es");
  return <SwitchLink href={q.size ? `${path}?${q.toString()}` : path} es={es} />;
}

function SwitchLink({ href, es }: { href: string; es: boolean }) {
  return (
    <Link href={href} hrefLang={es ? "en" : "es"} lang={es ? "en" : "es"}
      className="shrink-0 rounded-full bg-paper-2 px-2.5 py-1.5 text-sm font-semibold hover:bg-volt-2 sm:px-3">
      {/* short on phones so the header still fits at 320px; screen readers always hear the full word */}
      <span aria-hidden className="sm:hidden">{es ? "EN" : "ES"}</span>
      <span className="sr-only sm:not-sr-only">{es ? "English" : "Español"}</span>
    </Link>
  );
}

