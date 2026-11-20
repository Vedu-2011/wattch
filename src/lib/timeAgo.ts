/** "just now", "5 minutes ago", "3 hours ago", "2 days ago" — plain words for how old a reading is. Spanish: "hace 3 horas". */
export function timeAgo(iso: string, now: number = Date.now(), lang: "en" | "es" = "en"): string {
  const es = lang === "es";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return es ? "en un momento desconocido" : "at an unknown time";
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 60) return es ? "hace un momento" : "just now";
  const unit = (n: number, w: string, wEs: string) =>
    es ? `hace ${n} ${n === 1 ? wEs : wEs === "mes" ? "meses" : `${wEs}s`}` : `${n} ${w}${n === 1 ? "" : "s"} ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return unit(m, "minute", "minuto");
  const h = Math.floor(m / 60);
  if (h < 24) return unit(h, "hour", "hora");
  return unit(Math.floor(h / 24), "day", "día");
}
