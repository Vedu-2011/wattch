import { Wall } from "@/components/Wall";
import { clientPlans, snapshotInfo } from "@/lib/plans/data";

/** Reads ?kwh= from the URL, so it renders per request. */
export const instant = false;

export default async function WallPage({ searchParams }: PageProps<"/wall">) {
  const sp = await searchParams;
  const k = Math.round(Number(Array.isArray(sp.kwh) ? sp.kwh[0] : sp.kwh));
  const kwh = Number.isFinite(k) && k >= 100 && k <= 5000 ? k : 1100;
  return <Wall plans={clientPlans()} kwh={kwh} builtAt={snapshotInfo.builtAt} />;
}
