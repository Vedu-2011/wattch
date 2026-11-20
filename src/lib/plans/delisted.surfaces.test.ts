import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const { clientPlans } = await import("./data");
const { DELISTED, isListed } = await import("./delisted");
const { delistedDate } = await import("@/lib/delistedDate");
const { WORDS } = await import("@/lib/i18n");
const { headline } = await import("@/lib/headline");
const { trapGuide } = await import("@/lib/trapGuide");
const { heroStats } = await import("@/lib/hero");

// Every place that shows plans to people agrees with data/delisted.json.
describe("plans that left Power to Choose, on every surface", () => {
  it("the date on their page is Texas time, in both languages", () => {
    const d = new Date(DELISTED.checkedAt);
    const tx = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", month: "short", day: "numeric" }).format(d);
    expect(delistedDate("en")).toBe(tx);
    expect(delistedDate("es")).toMatch(/^\d{1,2} [a-z]{3,4}$/);
    expect(delistedDate("es")).not.toMatch(/\./);
  });

  it("the results footnote says they aren't ranked (EN + ES)", () => {
    expect(WORDS.en.rankNote(13)).toMatch(/left Power to Choose/);
    expect(WORDS.es.rankNote(13)).toMatch(/salieron de Power to Choose/);
    expect(WORDS.en.tileGone).toBeTruthy();
    expect(WORDS.es.tileGone).toBeTruthy();
  });

  for (const area of ["houston", "dallas"] as const) {
    it(`${area}: the headline, the trap examples and the home page's hero never use one`, () => {
      const plans = clientPlans(area);
      const h = headline(plans, area);
      expect(isListed(h.pick!.plan.id)).toBe(true);
      expect(isListed(h.best!.plan.id)).toBe(true);
      for (const t of trapGuide(plans, area)) if (t.example) expect(isListed(t.example.id), `${t.key} example`).toBe(true);
      const hero = heroStats(plans, 1100, 5, "en", area);
      expect(hero.cards.length).toBeGreaterThan(0);
      for (const c of hero.cards) expect(isListed(c.id), `home trap card ${c.planName}`).toBe(true);
    });
  }
});
