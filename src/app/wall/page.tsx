import type { Metadata } from "next";
import { Wall } from "@/components/Wall";
import { RESULT_KEYS, parseWallParams } from "@/lib/params";
import { areaInfo, clientPlans } from "@/lib/plans/data";

/** Reads ?kwh= from the URL, so it renders per request. */
export const instant = false;

type SP = Record<string, string | string[] | undefined>;
const parse = (sp: SP) => parseWallParams((k) => { const v = sp[k]; return Array.isArray(v) ? v[0] : v; });

export async function generateMetadata({ searchParams }: PageProps<"/wall">): Promise<Metadata> {
  const sp = await searchParams;
  const { kwh, area } = parse(sp);
  // the card reads the same params, so a shared link unfurls into that exact result
  const q = new URLSearchParams();
  for (const k of RESULT_KEYS) { const v = sp[k]; if (typeof v === "string") q.set(k, v); }
  const card = `/api/card?${q.toString()}`;
  return {
    title: `Wattch — every ${area === "dallas" ? "Dallas–Fort Worth" : "Houston"} plan at ${kwh.toLocaleString()} kWh`,
    openGraph: { images: [{ url: card, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", images: [card] },
  };
}

export default async function WallPage({ searchParams }: PageProps<"/wall">) {
  const { kwh, seasons, months, filters, withConditional, lang, area } = parse(await searchParams);
  return (
    <div lang={lang}>
      <Wall plans={clientPlans(area)} kwh={kwh} seasons={seasons} months={months} filters={filters} withConditional={withConditional} builtAt={areaInfo(area).builtAt} lang={lang} area={area} />
    </div>
  );
}
