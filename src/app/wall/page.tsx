import type { Metadata } from "next";
import { Wall } from "@/components/Wall";
import { parseWallParams } from "@/lib/params";
import { clientPlans, snapshotInfo } from "@/lib/plans/data";

/** Reads ?kwh= from the URL, so it renders per request. */
export const instant = false;

type SP = Record<string, string | string[] | undefined>;
const parse = (sp: SP) => parseWallParams((k) => { const v = sp[k]; return Array.isArray(v) ? v[0] : v; });

export async function generateMetadata({ searchParams }: PageProps<"/wall">): Promise<Metadata> {
  const sp = await searchParams;
  const { kwh } = parse(sp);
  // the card reads the same params, so a shared link unfurls into that exact result
  const q = new URLSearchParams();
  for (const k of ["kwh", "flat", "m", "lock", "nocliff", "green", "rated"]) { const v = sp[k]; if (typeof v === "string") q.set(k, v); }
  const card = `/api/card?${q.toString()}`;
  return {
    title: `Wattch — every Houston plan at ${kwh.toLocaleString()} kWh`,
    openGraph: { images: [{ url: card, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", images: [card] },
  };
}

export default async function WallPage({ searchParams }: PageProps<"/wall">) {
  const { kwh, seasons, months, filters } = parse(await searchParams);
  return <Wall plans={clientPlans()} kwh={kwh} seasons={seasons} months={months} filters={filters} builtAt={snapshotInfo.builtAt} />;
}
