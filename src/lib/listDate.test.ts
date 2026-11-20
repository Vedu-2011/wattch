import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LIST_DATE } from "./listDate";
import { WORDS } from "./i18n";
import { CARD_WORDS } from "./cardWords";

const tx = (iso: string, locale: string) =>
  new Intl.DateTimeFormat(locale, { timeZone: "America/Chicago", month: "short", day: "numeric" }).format(new Date(iso));

describe("'the state site's #1' is dated to the day Wattch read the list", () => {
  for (const f of ["data/plans.json", "data/plans-dallas.json"]) {
    it(`${f} was read on ${LIST_DATE.en} (Texas time)`, () => {
      const builtAt = JSON.parse(readFileSync(f, "utf8")).builtAt as string;
      expect(tx(builtAt, "en-US")).toBe(LIST_DATE.en);
      expect(LIST_DATE.es).toBe(`${tx(builtAt, "en-US").split(" ")[1]} de nov`);
    });
  }

  it("no screen says the state site 'lists first' today", () => {
    const all = JSON.stringify([WORDS.en.moreAYear(false), WORDS.en.moreAYear(true), WORDS.en.stateFirst(69), WORDS.en.shareGap("$378"),
      WORDS.en.bestBody("X", "$1"), CARD_WORDS.en.more]);
    expect(all).not.toMatch(/lists first/);
    expect(WORDS.en.moreAYear(false)).toContain(`listed first on ${LIST_DATE.en}`);
    expect(WORDS.en.stateFirst(69)).toContain(LIST_DATE.en);
    expect(CARD_WORDS.en.more).toContain(LIST_DATE.en);
    const es = JSON.stringify([WORDS.es.moreAYear(false), WORDS.es.stateFirst(69), WORDS.es.shareGap("$378"), CARD_WORDS.es.more]);
    expect(es).not.toMatch(/pone primero/);
    expect(WORDS.es.moreAYear(false)).toContain(`mostraba primero el ${LIST_DATE.es}`);
    expect(CARD_WORDS.es.more).toContain(LIST_DATE.es);
  });

  it("the phone label stays short", () => {
    expect(WORDS.en.stateFirst(143).length).toBeLessThanOrEqual(38);
    expect(WORDS.es.stateFirst(143).length).toBeLessThanOrEqual(42);
  });
});
