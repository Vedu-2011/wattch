"use client";
import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/timeAgo";

/** "Prices checked 3 hours ago". The server prints the date; the browser swaps in the relative time. */
export function Fresh({ at, prefix = "Prices checked", className = "", lang = "en", dateOnly = false }: { at: string; prefix?: string; className?: string; lang?: "en" | "es"; dateOnly?: boolean }) {
  const [label, setLabel] = useState(() =>
    new Date(at).toLocaleString(lang === "es" ? "es-US" : "en-US", dateOnly ? { month: "short", day: "numeric", timeZone: "America/Chicago" } : { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" }) + (dateOnly ? "" : " CT"),
  );
  useEffect(() => {
    const tick = () => setLabel(timeAgo(at, Date.now(), lang));
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, [at, lang]);
  return (
    <time dateTime={at} className={className} suppressHydrationWarning>
      {prefix ? `${prefix} ${label}` : label}
    </time>
  );
}
