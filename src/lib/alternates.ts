import { RESULT_KEYS } from "@/lib/params";

/**
 * hreflang pair for a page: the same URL with and without ?lang=es, every other setting kept, so search engines
 * know the English and Spanish versions belong together. Relative URLs resolve against metadataBase (layout.tsx).
 */
export function langPair(path: string, sp: Record<string, string | string[] | undefined>): { languages: { en: string; es: string } } {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    const one = Array.isArray(v) ? v[0] : v;
    if (k !== "lang" && one !== undefined) q.set(k, one);
  }
  const en = q.size ? `${path}?${q}` : path;
  q.set("lang", "es");
  return { languages: { en, es: `${path}?${q}` } };
}

type Sp = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/**
 * The share-card URL for a page: every setting that changes the result (usage, own months, flat, autopay, filters,
 * area, language) — the same list the results page forwards — so a shared link previews exactly what the page shows.
 * The card route validates each value itself. `over` fills in what the page knows better (a plan's own area).
 */
export function cardUrl(sp: Sp, over: { area?: "houston" | "dallas"; lang?: "en" | "es" } = {}): string {
  const q = new URLSearchParams();
  for (const k of RESULT_KEYS) { const v = first(sp[k]); if (v !== undefined) q.set(k, v); }
  if (!q.has("kwh")) q.set("kwh", "1100");
  if (over.area === "dallas") q.set("area", "dallas"); else if (over.area === "houston") q.delete("area");
  if (over.lang === "es") q.set("lang", "es");
  return `/api/card?${q}`;
}

/**
 * openGraph + twitter image fields for a page's metadata. A page that sets openGraph replaces the layout's whole
 * openGraph object, so siteName and type are repeated here.
 */
export function shareMeta(card: string) {
  return {
    openGraph: { siteName: "Wattch", type: "website" as const, images: [{ url: card, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image" as const, images: [card] },
  };
}
