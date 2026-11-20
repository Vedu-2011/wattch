import { z } from "zod";
import { PlanRecord } from "./schema";

/** The shape of data/plans.json. Checked when the server loads it, so a broken file can't show wrong numbers. */
export const Snapshot = z.object({
  builtAt: z.string(),
  source: z.string(),
  model: z.string(),
  counts: z.record(z.string(), z.number()),
  plans: z.array(PlanRecord).min(1),
});
export type Snapshot = z.infer<typeof Snapshot>;

export class SnapshotError extends Error {}

export function parseSnapshot(raw: unknown): Snapshot {
  const r = Snapshot.safeParse(raw);
  if (r.success) return r.data;
  const first = r.error.issues[0];
  // for the server log; the visitor only ever sees the friendly global error page
  throw new SnapshotError(`data/plans.json failed its check at ${first?.path.join(".") || "(root)"}: ${first?.message ?? "unknown"}`);
}
