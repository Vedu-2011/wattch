import { describe, expect, it } from "vitest";
import raw from "../../../data/plans.json";
import { SnapshotError, parseSnapshot } from "./snapshot";

describe("data/plans.json is checked on load", () => {
  it("today's file passes", () => {
    const s = parseSnapshot(raw);
    expect(s.plans.length).toBe((raw as { plans: unknown[] }).plans.length);
  });
  it("a broken file is refused with a message that says where", () => {
    const broken = structuredClone(raw) as { plans: { pricing: { energyTiers: unknown } | null }[] };
    const i = broken.plans.findIndex((p) => p.pricing);
    broken.plans[i].pricing!.energyTiers = "oops";
    expect(() => parseSnapshot(broken)).toThrow(SnapshotError);
    expect(() => parseSnapshot(broken)).toThrow(new RegExp(`plans\\.${i}\\.pricing\\.energyTiers`));
    expect(() => parseSnapshot({})).toThrow(SnapshotError);
    expect(() => parseSnapshot({ ...raw, plans: [] })).toThrow(SnapshotError);
  });
});
