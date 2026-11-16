import type { Metadata } from "next";
import { Wall } from "@/components/Wall";
import { monthsFromParam } from "@/lib/months";
import { clientPlans, snapshotInfo } from "@/lib/plans/data";

/** Reads ?kwh= from the URL, so it renders per request. */
export const instant = false;

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
function parse(sp: SP) {
  const k = Math.round(Number(one(sp.kwh)));
  const on = (key: string) => one(sp[key]) === "1";
  return {
    kwh: Number.isFinite(k) && k >= 100 && k <= 5000 ? k : 1100, seasons: one(sp.flat) !== "1", months: monthsFromParam(one(sp.m)),
    filters: { locked: on("lock"), noCliffs: on("nocliff"), green: on("green"), rated: on("rated") },
  };
}

export async function generateMetadata({ searchParams }: PageProps<"/wall">): Promise<Metadata> {
  const { kwh, seasons } = parse(await searchParams);
  const card = `/api/card?kwh=${kwh}${seasons ? "" : "&flat=1"}`;
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
