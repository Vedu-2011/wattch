import type { MetadataRoute } from "next";
import { areaInfo, clientPlans } from "@/lib/plans/data";

const BASE = "https://getwattch.vercel.app";

/** Every page in English, each with its Spanish twin as a language alternate. Plan pages for both areas. */
export default function sitemap(): MetadataRoute.Sitemap {
  // Next writes these into the XML as-is, so "&" must be escaped here or the whole sitemap is invalid XML
  const at = (u: string) => `${BASE}${u}`.replaceAll("&", "&amp;");
  const es = (u: string) => (u === "/" ? "/es" : `${u}${u.includes("?") ? "&" : "?"}lang=es`);
  const entry = (u: string, lastModified: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: at(u), lastModified, priority, changeFrequency: "daily",
    alternates: { languages: { en: at(u), es: at(es(u)) } },
  });
  const built = areaInfo("houston").builtAt;
  const pages = [
    entry("/", built, 1), entry("/wall?kwh=1100", built, 0.9), entry("/wall?kwh=1100&area=dallas", areaInfo("dallas").builtAt, 0.9),
    entry("/traps", built, 0.7), entry("/traps?area=dallas", built, 0.6), entry("/how", built, 0.6),
    entry("/sources", built, 0.4), entry("/remind", built, 0.5),
  ];
  const plans = (["houston", "dallas"] as const).flatMap((area) =>
    clientPlans(area).map((p) => entry(area === "dallas" ? `/plan/${p.id}?area=dallas` : `/plan/${p.id}`, areaInfo(area).builtAt, 0.5)),
  );
  return [...pages, ...plans];
}
