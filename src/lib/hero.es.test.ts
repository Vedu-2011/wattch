import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { clientPlans } = await import("@/lib/plans/data");
const { HEADLINE_KWH } = await import("@/lib/headline");
const { heroStats } = await import("./hero");

// /es and / must show the same numbers, plans and order — only the words change.
describe("Spanish home = English home, same math", () => {
  for (const area of ["houston", "dallas"] as const) {
    it(area, () => {
      const plans = clientPlans(area);
      const en = heroStats(plans, HEADLINE_KWH, 5, "en", area);
      const es = heroStats(plans, HEADLINE_KWH, 5, "es", area);
      const nums = (s: typeof en) => ({ total: s.total, read: s.read, withTrap: s.withTrap, cards: s.cards.map(({ id, sticker, real, over }) => ({ id, sticker, real, over })) });
      expect(nums(es)).toEqual(nums(en));
      expect(es.cards.length).toBeGreaterThan(0);
      // the words really are Spanish (and differ from English) wherever there is a "why" line
      es.cards.forEach((c, i) => { if (c.why) expect(c.why).not.toBe(en.cards[i].why); });
    });
  }
});
