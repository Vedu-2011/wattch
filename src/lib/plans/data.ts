import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import raw from "../../../data/plans.json";
import type { PlanRecord } from "./schema";
import { parseSnapshot } from "./snapshot";
import type { ClientPlan } from "@/lib/rank";

// zod-checked once per server start; a broken file throws here and the visitor sees app/global-error.tsx
const snap = parseSnapshot(raw);

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
