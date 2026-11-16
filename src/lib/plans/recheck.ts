import type { PlanRecord } from "./schema";

/**
 * Can "Check this label again now" say anything true about this plan? Only if Wattch read the label before.
 * A never-read plan would always look "changed", and opening it can cost a paid read. The plan page (button) and
 * /api/live (answer) both use this one rule. Not the fingerprint: 2 hand-read Houston labels have none, but their
 * printed prices can still be compared.
 */
export function canRecheck(rec: Pick<PlanRecord, "check">): boolean {
  return rec.check.status !== "unread";
}
