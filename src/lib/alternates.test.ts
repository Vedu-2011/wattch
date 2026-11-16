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
    expect(cardUrl({ kwh: "1500", area: "dallas", lang: "es", a: "1" })).toBe("/api/card?kwh=1500&area=dallas&lang=es");
    expect(cardUrl({})).toBe("/api/card?kwh=1100");
    expect(cardUrl({ kwh: "abc", area: "xx", lang: "fr" })).toBe("/api/card?kwh=1100");
    expect(cardUrl({}, { area: "dallas", lang: "es" })).toBe("/api/card?kwh=1100&area=dallas&lang=es");
  });
  it("repeats siteName and type (a page's openGraph replaces the layout's)", () => {
    const m = shareMeta("/api/card?kwh=1100");
    expect(m.openGraph.siteName).toBe("Wattch");
    expect(m.openGraph.type).toBe("website");
    expect(m.twitter.images).toEqual(["/api/card?kwh=1100"]);
  });
});
