"use client";
import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/timeAgo";

/** "Prices checked 3 hours ago". The server prints the date; the browser swaps in the relative time. */
export function Fresh({ at, prefix = "Prices checked", className = "" }: { at: string; prefix?: string; className?: string }) {
  const [label, setLabel] = useState(() =>
    new Date(at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" }) + " CT",
  );
  useEffect(() => {
    const tick = () => setLabel(timeAgo(at));
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, [at]);
  return (
    <time dateTime={at} className={className} suppressHydrationWarning>
      {prefix ? `${prefix} ${label}` : label}
    </time>
  );
}
