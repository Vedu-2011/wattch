import { describe, expect, it } from "vitest";
import { COMPARE_WORDS } from "@/lib/compareWords";
import { WORDS } from "@/lib/i18n";
import { PLAN_WORDS } from "@/lib/planWords";
import { CURRENT_WORDS } from "@/lib/wallToolsWords";

// "1 months", "1 meses" and "0 months" showed on variable plans; terms read like a person wrote them.
describe("month wording", () => {
  for (const W of [PLAN_WORDS, COMPARE_WORDS]) {
    it("plan terms", () => {
      expect([W.en.months(0), W.en.months(1), W.en.months(12)]).toEqual(["month to month", "1 month", "12 months"]);
      expect([W.es.months(0), W.es.months(1), W.es.months(12)]).toEqual(["mes a mes", "1 mes", "12 meses"]);
    });
  }
  it("short-price chip and payback", () => {
    expect(WORDS.es.monthPrice(1)).toBe("precio por 1 mes");
    expect(WORDS.es.monthPrice(3)).toBe("precio por 3 meses");
    expect(CURRENT_WORDS.es.mo(1)).toBe("1 mes");
  });
});
