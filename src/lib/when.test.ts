import { describe, expect, it } from "vitest";
import { texasDay, texasTime } from "./when";

describe("Texas time", () => {
  it("05:30 UTC is still the evening before in Texas", () => {
    expect(texasDay("2026-11-16T05:30:00Z")).toBe("Nov 15");
    expect(texasDay("2026-11-16T05:30:00Z", "es")).toMatch(/^15 nov/);
  });
  it("time carries CT", () => {
    expect(texasTime("2026-11-16T07:03:00Z")).toBe("Nov 16, 1:03 AM CT");
  });
});
