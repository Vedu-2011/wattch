import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { HEADLINE_KWH, headline, toClientPlan } from "./headline";
import { filterOpts, parseWallParams } from "./params";
import { AREAS, type Area } from "./plans/ptc";
import { PlanRecord } from "./plans/schema";
import { reveal } from "./rank";

const load = (area: Area) => (JSON.parse(readFileSync(AREAS[area].dataFile, "utf8")).plans as unknown[]).map((p) => toClientPlan(PlanRecord.parse(p)));

describe("one headline, everywhere", () => {
  for (const area of ["houston", "dallas"] as const) {
    it(`${area}: the wall and share card at their default URL compute exactly the headline`, () => {
      const plans = load(area);
      const h = headline(plans, area);
      // what /wall and /api/card do with ?kwh=1100 (&area=dallas)
      const q = new URLSearchParams(`kwh=${HEADLINE_KWH}${area === "dallas" ? "&area=dallas" : ""}`);
      const p = parseWallParams((k) => q.get(k));
      const wall = reveal(plans, p.kwh, { seasons: p.seasons, months: p.months, area: p.area, includeConditional: p.withConditional, ...filterOpts(p.filters) });
      expect(wall.gap).toBe(h.gap);
      expect(wall.pickRank).toBe(h.pickRank);
      expect(wall.best?.plan.id).toBe(h.best?.plan.id);
      expect(wall.pick?.plan.id).toBe(h.pick?.plan.id);
    });
  }
  it("Houston's headline is the one in the deck, video and Devpost ($378, state #1 ranks #69 of the plans still listed)", () => {
    const h = headline(load("houston"));
    expect(Math.round(h.gap)).toBe(378);
    expect(h.pickRank).toBe(69);
    expect(h.pick?.plan.id).toBe("33633");
    expect(h.best?.plan.id).toBe("37797");
  });
  it("Dallas–Fort Worth: state #1 ranks #82, $530 a year more (after the free form-field rescue, Nov 16)", () => {
    const h = headline(load("dallas"), "dallas");
    expect(Math.round(h.gap)).toBe(530);
    expect(h.pickRank).toBe(82);
  });
});
