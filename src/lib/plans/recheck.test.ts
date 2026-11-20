import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const { clientPlans, planById } = await import("./data");
const { canRecheck } = await import("./recheck");

describe("canRecheck — one rule for the re-check button and /api/live", () => {
  for (const area of ["houston", "dallas"] as const) {
    it(`${area}: never-read plans can't be re-checked; every plan Wattch read can`, () => {
      let unread = 0;
      for (const p of clientPlans(area)) {
        const rec = planById(p.id)!;
        if (rec.check.status === "unread") { unread++; expect(canRecheck(rec), p.id).toBe(false); }
        else expect(canRecheck(rec), p.id).toBe(true);
      }
      if (area === "dallas") expect(unread).toBeGreaterThan(0);
      // hand-read labels without a stored fingerprint still get the button (regression: 17330 was hidden for a while)
      if (area === "houston") expect(canRecheck(planById("17330")!)).toBe(true);
    });
  }
});
