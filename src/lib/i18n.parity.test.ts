import { describe, expect, it } from "vitest";
import { LIVE_WORDS } from "@/components/LiveCheck";
import { FOOT, NAV } from "@/components/SiteChrome";
import { EXPLAIN_WORDS } from "@/lib/bill/explain";
import { readFileSync } from "node:fs";
import { MONTHS_BY_LANG, TRAP_LABELS, WORDS } from "@/lib/i18n";
import { PlanRecord } from "@/lib/plans/schema";
import { traps } from "@/lib/rank";
import { ICS_WORDS, PROBLEMS } from "@/lib/ics";
import { COMPARE_WORDS } from "@/lib/compareWords";
import { HOW_WORDS } from "@/lib/howWords";
import { MONTHS_ERRORS } from "@/lib/months";
import { CURRENT_WORDS, MYMONTHS_WORDS } from "@/lib/wallToolsWords";
import { TRAP_KINDS } from "@/lib/trapGuide";
import { TRAPS_WORDS, TRAP_KINDS_ES } from "@/lib/trapsWords";
import { PLAN_WORDS } from "@/lib/planWords";
import { QUESTION_WORDS } from "@/lib/questions";
import { REMIND_WORDS } from "@/lib/remindWords";

/** Each table's shape: key → "fn/<arity>" or "text" — so a missing key or a function with different arguments shows up. */
const shape = (o: object) =>
  Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeof v === "function" ? `fn/${v.length}` : typeof v]));

const TABLES: [string, { en: object; es: object }][] = [
  ["words()", WORDS], ["plan page", PLAN_WORDS], ["bill sentences", EXPLAIN_WORDS],
  ["questions", QUESTION_WORDS], ["calendar file", ICS_WORDS], ["date errors", PROBLEMS], ["reminder page", REMIND_WORDS],
  ["live re-check", LIVE_WORDS], ["compare page", COMPARE_WORDS], ["trap guide page", TRAPS_WORDS], ["already on a plan", CURRENT_WORDS], ["my 12 months", MYMONTHS_WORDS], ["month errors", MONTHS_ERRORS], ["how it works", HOW_WORDS], ["header", NAV], ["footer", { en: { t: FOOT.en }, es: { t: FOOT.es } }],
];

/** names that are the same in both languages */
const SAME_OK = new Set(["areaHouston", "areaDallas"]);

describe("every English string has a Spanish one", () => {
  it("every trap kind in the real data has a Spanish name (English uses the trap's own label)", () => {
    for (const file of ["data/plans.json", "data/plans-dallas.json"]) for (const raw of JSON.parse(readFileSync(file, "utf8")).plans as unknown[]) {
      const p = PlanRecord.parse(raw).pricing;
      if (p) for (const t of traps(p)) expect(TRAP_LABELS.es[t.key], t.key).toBeTruthy();
    }
  });
  for (const [name, t] of TABLES) {
    it(name, () => {
      expect(shape(t.es)).toEqual(shape(t.en));
      for (const [k, v] of Object.entries(t.es)) if (typeof v === "string" && k !== "langNote") expect(v.trim(), `${name}.${k}`).not.toBe("");
    });
  }
  it("every trap guide kind has a Spanish name, what and bite", () => {
    for (const k of TRAP_KINDS) {
      const es = TRAP_KINDS_ES[k.key];
      expect(es?.name && es.what && es.bite, k.key).toBeTruthy();
      expect(es.what).not.toBe(k.what);
    }
  });
  it("12 month names each", () => {
    expect(MONTHS_BY_LANG.es).toHaveLength(12);
    expect(MONTHS_BY_LANG.en).toHaveLength(12);
  });
  it("no Spanish text is just the English text copied", () => {
    for (const [name, t] of TABLES) for (const [k, v] of Object.entries(t.es)) {
      const en = (t.en as Record<string, unknown>)[k];
      if (typeof v === "string" && v.length > 12 && !SAME_OK.has(k)) expect(v, `${name}.${k}`).not.toBe(en);
    }
  });
});
