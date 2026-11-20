import type { Area } from "@/lib/plans/ptc";
import { isListed } from "@/lib/plans/delisted";
import type { PlanRecord } from "@/lib/plans/schema";
import { type ClientPlan, reveal } from "@/lib/rank";

/**
 * The headline every surface quotes (home, demo, deck, Devpost, video): an average home, 1,100 kWh a month,
 * shaped like the area's real year, autopay discounts counted, no filters. One place, so nothing drifts.
 * The /wall and the share card at their default settings compute exactly this (tested in headline.test.ts).
 */
export const HEADLINE_KWH = 1100;
export const HEADLINE_OPTS = { seasons: true, includeConditional: true } as const;

export function headline(plans: ClientPlan[], area: Area = "houston") {
  const r = reveal(plans, HEADLINE_KWH, { ...HEADLINE_OPTS, area });
  return { kwh: HEADLINE_KWH, area, ...r };
}

/** The ranking fields of a full plan record (what clientPlans() sends; scripts use it without the server-only module). */
export const toClientPlan = (r: PlanRecord): ClientPlan => ({
  id: r.meta.id, provider: r.meta.provider, planName: r.meta.planName, rateType: r.meta.rateType,
  renewablePct: r.meta.renewablePct, rating: r.meta.rating, prepaid: r.meta.prepaid, ptc: r.meta.ptc,
  status: r.check.status, listed: isListed(r.meta.id), readMs: r.read.readMs,
  pricing: r.pricing ? { ...r.pricing, notes: [] } : null,
});
