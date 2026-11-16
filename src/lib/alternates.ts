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
