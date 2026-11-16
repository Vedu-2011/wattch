import { describe, expect, it } from "vitest";
import { langPair } from "./alternates";

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
