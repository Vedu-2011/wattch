import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { pipelineCounts, areaOf, clientPlans } = await import("./data");

describe("which area a plan belongs to (compare refuses to mix areas)", () => {
  it("every plan id maps back to its own area; unknown ids map to nothing", () => {
    for (const area of ["houston", "dallas"] as const) for (const p of clientPlans(area)) expect(areaOf(p.id)).toBe(area);
    expect(areaOf("no-such-plan")).toBeUndefined();
    expect(areaOf("33633")).toBe("houston");
    expect(areaOf("17283")).toBe("dallas");
  });
});

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
  it("Houston matches the numbers in the demo script (172 → 171 → 143; 12 left Power to Choose by Nov 19)", () => {
    expect(pipelineCounts("houston")).toMatchObject({ total: 172, verified: 171, ranked: 143 });
  });
});
