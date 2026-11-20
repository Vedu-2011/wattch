import { describe, expect, it } from "vitest";
import { cardUrl, langPair, shareMeta } from "./alternates";

describe("hreflang pair", () => {
  it("same settings, with and without lang=es, whichever side you start on", () => {
    const want = { languages: { en: "/wall?kwh=900&area=dallas", es: "/wall?kwh=900&area=dallas&lang=es" } };
    expect(langPair("/wall", { kwh: "900", area: "dallas" })).toEqual(want);
    expect(langPair("/wall", { kwh: "900", lang: "es", area: "dallas" })).toEqual(want);
  });
  it("no settings → bare path, no trailing ?", () => {
    expect(langPair("/how", {})).toEqual({ languages: { en: "/how", es: "/how?lang=es" } });
  });
  it("repeated params keep the first value; missing ones are skipped", () => {
    expect(langPair("/compare", { a: ["1", "2"], b: undefined })).toEqual({ languages: { en: "/compare?a=1", es: "/compare?a=1&lang=es" } });
  });
});

describe("share card per page", () => {
  it("keeps usage, area and language; ignores anything else", () => {
    expect(cardUrl({ kwh: "1500", area: "dallas", lang: "es", a: "1", b: "2" })).toBe("/api/card?kwh=1500&lang=es&area=dallas");
    expect(cardUrl({})).toBe("/api/card?kwh=1100");
    expect(cardUrl({}, { area: "dallas", lang: "es" })).toBe("/api/card?kwh=1100&area=dallas&lang=es");
    // a plan's own area wins over a stray ?area=
    expect(cardUrl({ area: "dallas" }, { area: "houston" })).toBe("/api/card?kwh=1100");
  });
  it("forwards every setting that changes the result (Codex 15), like the results page does", () => {
    const u = new URL(cardUrl({ kwh: "900", flat: "1", noauto: "1", m: "1,2,3,4,5,6,7,8,9,10,11,12", lock: "1", green: "1" }), "http://x");
    for (const k of ["kwh", "flat", "noauto", "m", "lock", "green"]) expect(u.searchParams.has(k), k).toBe(true);
  });
  it("repeats siteName and type (a page's openGraph replaces the layout's)", () => {
    const m = shareMeta("/api/card?kwh=1100");
    expect(m.openGraph.siteName).toBe("Wattch");
    expect(m.openGraph.type).toBe("website");
    expect(m.twitter.images).toEqual(["/api/card?kwh=1100"]);
  });
});
