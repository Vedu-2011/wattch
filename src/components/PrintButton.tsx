"use client";
import type { Lang } from "@/lib/i18n";

/** Prints the plan page (label check + bill on one page; see the print rules in globals.css). */
export function PrintButton({ lang = "en" }: { lang?: Lang }) {
  return (
    <button type="button" onClick={() => window.print()} className="rounded-full bg-paper-2 px-3 py-1.5 text-sm font-medium hover:bg-volt-2">
      {lang === "es" ? "Imprimir" : "Print"}
    </button>
  );
}
