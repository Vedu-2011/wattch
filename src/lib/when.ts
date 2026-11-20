/** Dates and times on the page are always Texas time (where the plans and the reads are), whatever the viewer's clock. */
const loc = (lang: "en" | "es") => (lang === "es" ? "es-US" : "en-US");
export const texasDay = (iso: string, lang: "en" | "es" = "en") =>
  new Date(iso).toLocaleDateString(loc(lang), { month: "short", day: "numeric", timeZone: "America/Chicago" });
export const texasTime = (iso: string, lang: "en" | "es" = "en") =>
  new Date(iso).toLocaleString(loc(lang), { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" }) + " CT";
