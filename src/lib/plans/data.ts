import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import raw from "../../../data/plans.json";
import type { PlanRecord } from "./schema";
import type { ClientPlan } from "@/lib/rank";

type Snapshot = { builtAt: string; source: string; model: string; counts: Record<string, number>; plans: PlanRecord[] };
const snap = raw as unknown as Snapshot;

export const snapshotInfo = { builtAt: snap.builtAt, source: snap.source, model: snap.model, counts: snap.counts, total: snap.plans.length };

/**
 * What the browser needs to rank and price every plan — nothing more (no label text, check rows, links or AI notes;
 * the plan page reads those on the server). Keeps /wall's HTML small.
 */
export function clientPlans(): ClientPlan[] {
  return snap.plans.map((r) => ({
    id: r.meta.id, provider: r.meta.provider, planName: r.meta.planName, rateType: r.meta.rateType,
    renewablePct: r.meta.renewablePct, rating: r.meta.rating, prepaid: r.meta.prepaid, ptc: r.meta.ptc,
    status: r.check.status, readMs: r.read.readMs,
    pricing: r.pricing ? { ...r.pricing, notes: [] } : null,
  }));
}

/** The label text exactly as the reader saw it (data/text/<id>.txt), or null if we don't have it. */
export function labelText(id: string): string | null {
  if (!/^[A-Za-z0-9_-]+$/.test(id)) return null;
  try {
    return readFileSync(join(process.cwd(), "data", "text", `${id}.txt`), "utf8");
  } catch {
    return null;
  }
}

export function planById(id: string): PlanRecord | undefined {
  return snap.plans.find((p) => p.meta.id === id);
}
