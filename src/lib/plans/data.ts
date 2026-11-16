import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import raw from "../../../data/plans.json";
import rawDallas from "../../../data/plans-dallas.json";
import { AREAS, type Area } from "./ptc";
import type { PlanRecord } from "./schema";
import { parseSnapshot } from "./snapshot";
import { type ClientPlan, rankable } from "@/lib/rank";

// zod-checked once per server start; a broken file throws here and the visitor sees app/global-error.tsx
const snaps: Record<Area, ReturnType<typeof parseSnapshot>> = { houston: parseSnapshot(raw), dallas: parseSnapshot(rawDallas) };
const snap = snaps.houston;

const info = (s: ReturnType<typeof parseSnapshot>) => ({ builtAt: s.builtAt, source: s.source, model: s.model, counts: s.counts, total: s.plans.length });
/** Houston (the main area): when it was read and how many labels add up. */
export const snapshotInfo = info(snap);
export const areaInfo = (area: Area) => info(snaps[area]);

/** The /how diagram's numbers for one area, straight from its snapshot. */
export function pipelineCounts(area: Area) {
  const s = snaps[area];
  const n = (k: string) => s.counts[k] ?? 0;
  return { total: s.plans.length, read: s.plans.length - n("unread"), verified: n("verified"), mismatch: n("mismatch"), unread: n("unread"), ranked: rankable(clientPlans(area)).length };
}

/**
 * What the browser needs to rank and price every plan in one area — nothing more (no label text, check rows, links
 * or AI notes; the plan page reads those on the server). Keeps /wall's HTML small.
 */
export function clientPlans(area: Area = "houston"): ClientPlan[] {
  return snaps[area].plans.map((r) => ({
    id: r.meta.id, provider: r.meta.provider, planName: r.meta.planName, rateType: r.meta.rateType,
    renewablePct: r.meta.renewablePct, rating: r.meta.rating, prepaid: r.meta.prepaid, ptc: r.meta.ptc,
    status: r.check.status, readMs: r.read.readMs,
    pricing: r.pricing ? { ...r.pricing, notes: [] } : null,
  }));
}

/** Which area a plan id belongs to (ids are Power to Choose's, unique across areas). */
export function areaOf(id: string): Area | undefined {
  return (Object.keys(snaps) as Area[]).find((a) => snaps[a].plans.some((p) => p.meta.id === id));
}

/** The label text exactly as the reader saw it (data/text/<id>.txt, or that area's folder), or null if we don't have it. */
export function labelText(id: string): string | null {
  if (!/^[A-Za-z0-9_-]+$/.test(id)) return null;
  const area = areaOf(id);
  if (!area) return null;
  try {
    return readFileSync(join(process.cwd(), AREAS[area].textDir, `${id}.txt`), "utf8");
  } catch {
    return null;
  }
}

export function planById(id: string): PlanRecord | undefined {
  for (const a of Object.keys(snaps) as Area[]) {
    const p = snaps[a].plans.find((x) => x.meta.id === id);
    if (p) return p;
  }
  return undefined;
}
