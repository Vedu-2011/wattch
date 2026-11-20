import { DELISTED } from "@/lib/plans/delisted";

/** "Nov 19" / "19 nov": when Wattch last checked which plans left Power to Choose (Texas time). */
export function delistedDate(lang: "en" | "es"): string {
  const d = new Date(DELISTED.checkedAt);
  const f = new Intl.DateTimeFormat(lang === "es" ? "es-US" : "en-US", { month: "short", day: "numeric", timeZone: "America/Chicago" });
  return f.format(d).replace(".", "");
}
