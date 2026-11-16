import { describe, expect, it } from "vitest";
import { plainLabelUrl } from "./fetchEfl";

const day = new Date("2026-11-15T12:00:00Z");

describe("plainLabelUrl: label links that hide the label", () => {
  it("Express Energy viewer page → the PDF it builds in the browser", () => {
    const u = plainLabelUrl(
      "https://shopping.myexpressenergy.com/PDFGenerator?formType=EnergyFactsLabel&comProdId=CPEXSPDYVBC12AD&tdsp=CENTERP&lang=en&custClass=Residential",
      day,
    );
    expect(u).toBe(
      "https://shopping.myexpressenergy.com/api/getdocument?docType=EnergyFactsLabel&productid=CPEXSPDYVBC12AD&efldate=2026-11-15T00%3A00%3A00&tdsp=CENTERP&language=en&classification=Residential",
    );
  });
  it("Veteran Energy and TriEagle use the same viewer", () => {
    expect(plainLabelUrl("https://shopping.veteranenergyusa.com/PDFGenerator?formType=EnergyFactsLabel&comProdId=CPVTBASICAC08AB&tdsp=CENTERP&lang=en&custClass=Residential", day))
      .toContain("shopping.veteranenergyusa.com/api/getdocument?docType=EnergyFactsLabel&productid=CPVTBASICAC08AB");
    expect(plainLabelUrl("https://shopping.trieagleenergy.com/PDFGenerator?formType=EnergyFactsLabel&comProdId=CPXTESMSAVC12AA&tdsp=CENTERP&lang=en&custClass=Residential", day))
      .toContain("productid=CPXTESMSAVC12AA");
  });
  it("Octopus Spanish label → the English one for the same plan", () => {
    expect(plainLabelUrl("https://octopusenergy.com/es/efl?productId=OCTO-SIMPLE-14&serviceProvider=CENTERPOINT&loadZone=LZ_HOUSTON"))
      .toBe("https://octopusenergy.com/efl?productId=OCTO-SIMPLE-14&serviceProvider=CENTERPOINT&loadZone=LZ_HOUSTON");
  });
  it("leaves normal links alone", () => {
    const plain = "https://example-provider.test/efl/plan-12.pdf";
    expect(plainLabelUrl(plain)).toBe(plain);
    expect(plainLabelUrl("https://shopping.myexpressenergy.com/PDFGenerator?formType=TermsOfService&comProdId=X")).toBe(
      "https://shopping.myexpressenergy.com/PDFGenerator?formType=TermsOfService&comProdId=X",
    );
  });
});
