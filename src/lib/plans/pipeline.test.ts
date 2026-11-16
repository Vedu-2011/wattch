import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { pipelineCounts } = await import("./data");

describe("/how diagram numbers", () => {
  for (const area of ["houston", "dallas"] as const) {
    it(`${area}: each stage is a subset of the one before, and read = total − unread`, () => {
      const c = pipelineCounts(area);
      expect(c.total).toBeGreaterThan(100);
      expect(c.read).toBe(c.total - c.unread);
      expect(c.verified + c.mismatch).toBe(c.read);
      expect(c.ranked).toBeGreaterThan(0);
      expect(c.ranked).toBeLessThanOrEqual(c.verified);
    });
  }
  it("Houston matches the numbers in the demo script (172 → 171 → 154)", () => {
    expect(pipelineCounts("houston")).toMatchObject({ total: 172, verified: 171, ranked: 154 });
  });
});
