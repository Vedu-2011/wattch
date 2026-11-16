import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { clientPlans } = await import("@/lib/plans/data");
const { whyLine, yearFor } = await import("./rank");
const { explainBill } = await import("./bill/explain");
const { questions } = await import("./questions");
const { AREAS } = await import("./plans/ptc");

// Translation must never change a number. For every plan we can price, in both areas and at three usages, the Spanish
// sentences must contain exactly the same numbers as the English ones (as a sorted list; word order may differ).
const nums = (s: string | null | undefined) => (s ?? "").match(/\d[\d,]*(?:\.\d+)?/g)?.map((x) => x.replace(/,/g, "")).sort() ?? [];

describe("Spanish sentences carry the same numbers as English", () => {
  for (const area of ["houston", "dallas"] as const) {
    it(area, () => {
      const plans = clientPlans(area).filter((p) => p.pricing);
      const utility = AREAS[area].utility;
      let checked = 0;
      for (const p of plans) {
        for (const kwh of [500, 1100, 2000]) {
          const months = yearFor(kwh, true, area);
          expect(nums(whyLine(p.pricing!, months, "es")), `${p.id} why @${kwh}`).toEqual(nums(whyLine(p.pricing!, months, "en")));
          const en = explainBill(p.pricing!, kwh, { utility, lang: "en" }), es = explainBill(p.pricing!, kwh, { utility, lang: "es" });
          expect(es.map((l) => l.key), `${p.id} bill keys`).toEqual(en.map((l) => l.key));
          en.forEach((l, i) => expect(nums(es[i].text), `${p.id} ${l.key} @${kwh}`).toEqual(nums(l.text)));
          const qe = questions(p.pricing!, months, 4, "en"), qs = questions(p.pricing!, months, 4, "es");
          expect(qs.map((q) => q.key), `${p.id} question keys`).toEqual(qe.map((q) => q.key));
          qe.forEach((q, i) => expect(nums(qs[i].q + " " + qs[i].why), `${p.id} ${q.key} @${kwh}`).toEqual(nums(q.q + " " + q.why)));
          checked++;
        }
      }
      expect(checked).toBeGreaterThan(400);
    });
  }
});
