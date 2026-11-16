"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * "Español" / "English" in the header, on the pages that have Spanish (home, the wall, plan pages, reminders).
 * Home is / and /es; the others keep every setting and flip ?lang=es.
 */
export function LangSwitch() {
  const path = usePathname();
  const sp = useSearchParams();
  let href: string | null = null;
  let es = false;
  const keep = sp.toString() ? `?${sp.toString()}` : ""; // home keeps ?area=dallas
  if (path === "/") href = `/es${keep}`;
  else if (path === "/es") { href = `/${keep}`; es = true; }
  else if (path === "/wall" || path === "/remind" || path === "/compare" || path === "/traps" || path === "/how" || path === "/sources" || path.startsWith("/plan/")) {
    es = sp.get("lang") === "es";
    const q = new URLSearchParams(sp.toString());
    if (es) q.delete("lang"); else q.set("lang", "es");
    href = q.size ? `${path}?${q.toString()}` : path;
  }
  if (!href) return null;
  return (
    <Link href={href} hrefLang={es ? "en" : "es"} lang={es ? "en" : "es"}
      className="shrink-0 rounded-full bg-paper-2 px-2.5 py-1.5 text-sm font-semibold hover:bg-volt-2 sm:px-3">
      {/* short on phones so the header still fits at 375px; screen readers always hear the full word */}
      <span aria-hidden className="sm:hidden">{es ? "EN" : "ES"}</span>
      <span className="sr-only sm:not-sr-only">{es ? "English" : "Español"}</span>
    </Link>
  );
}
