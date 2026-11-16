import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import GlobalError from "./global-error";

// The last-resort page replaces the whole document, so it shows English and Spanish together.
describe("global error page", () => {
  it("says it in both languages, never shows the error itself", () => {
    const html = renderToStaticMarkup(GlobalError({ error: new Error("plans.json failed zod: secret detail"), reset: () => {} }));
    expect(html).toContain("Wattch is taking a short break.");
    expect(html).toContain("Wattch está en una pausa corta.");
    expect(html).toContain("Intentar otra vez");
    expect(html).toMatch(/<div lang="es">/);
    expect(html).not.toContain("secret detail");
  });
});
