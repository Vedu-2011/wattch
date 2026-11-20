import { describe, expect, it } from "vitest";
import { providerTitle, shortProvider } from "./names";

describe("provider names", () => {
  it("drops company suffixes and (TX)", () => {
    expect(shortProvider("AP GAS & ELECTRIC (TX) LLC")).toBe("AP GAS & ELECTRIC");
    expect(shortProvider("CONSTELLATION NEWENERGY INC")).toBe("CONSTELLATION NEWENERGY");
    expect(providerTitle("AP GAS & ELECTRIC (TX) LLC")).toBe("Ap Gas & Electric");
  });
});
