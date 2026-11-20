import type { Metadata } from "next";
import { langPair, shareMeta } from "@/lib/alternates";
import { Wall } from "@/components/Wall";
import { RESULT_KEYS, parseWallParams } from "@/lib/params";
import { areaInfo, clientPlans } from "@/lib/plans/data";
import { AREAS } from "@/lib/plans/ptc";

/** Reads ?kwh= from the URL, so it renders per request. */
export const instant = false;

type SP = Record<string, string | string[] | undefined>;
const parse = (sp: SP) => parseWallParams((k) => { const v = sp[k]; return Array.isArray(v) ? v[0] : v; });

export async function generateMetadata({ searchParams }: PageProps<"/wall">): Promise<Metadata> {
  const sp = await searchParams;
  const { kwh, area, lang } = parse(sp);
  const city = AREAS[area].city, k = kwh.toLocaleString("en-US");
  // the card reads the same params, so a shared link unfurls into that exact result
  const q = new URLSearchParams();
  for (const k of RESULT_KEYS) { const v = sp[k]; if (typeof v === "string") q.set(k, v); }
  const card = `/api/card?${q.toString()}`;
  return {
    title: lang === "es" ? `Wattch — todos los planes de ${city} con ${k} kWh` : `Wattch — every ${city} plan at ${k} kWh`,
    description: lang === "es"
      ? `Cada plan de luz de ${city}, con el precio de ${k} kWh al mes durante un año real en ${city}, con la letra pequeña revisada.`
      : `Every ${city} electricity plan, priced at ${k} kWh a month through a real ${city} year, with the fine print checked.`,
    ...shareMeta(card),
    alternates: langPair("/wall", sp),
  };
}

export default async function WallPage({ searchParams }: PageProps<"/wall">) {
  const { kwh, kwhNote, seasons, months, filters, withConditional, lang, area } = parse(await searchParams);
  return (
    <div lang={lang}>
      <Wall plans={clientPlans(area)} kwh={kwh} seasons={seasons} months={months} filters={filters} withConditional={withConditional} builtAt={areaInfo(area).builtAt} lang={lang} area={area} kwhNote={kwhNote} />
    </div>
  );
}
