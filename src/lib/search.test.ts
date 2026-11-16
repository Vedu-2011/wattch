import { describe, expect, it } from "vitest";
import { fold, searchPlans } from "./search";

const plans = [
  { provider: "Energía Uno", planName: "Simple Saver 3" },
  { provider: "AP GAS & ELECTRIC", planName: "SimpleSaver 12" },
  { provider: "Abundance Energy", planName: "Confident Renter 6" },
];

describe("plan search", () => {
  it("ignores case and accents", () => {
    expect(fold("ÉNERGÍA")).toBe("energia");
    expect(searchPlans(plans, "energia").map((p) => p.planName)).toEqual(["Simple Saver 3"]);
    expect(searchPlans(plans, "SIMPLE saver").map((p) => p.planName)).toEqual(["Simple Saver 3", "SimpleSaver 12"]);
  });
  it("matches provider and name, words in any order", () => {
    expect(searchPlans(plans, "renter abundance")).toHaveLength(1);
    expect(searchPlans(plans, "ap 12")[0].planName).toBe("SimpleSaver 12");
  });
  it("blank or no match → nothing", () => {
    expect(searchPlans(plans, "   ")).toEqual([]);
    expect(searchPlans(plans, "zzzz")).toEqual([]);
  });
});
