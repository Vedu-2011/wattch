import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { default: sitemap } = await import("./sitemap");

describe("sitemap", () => {
  const s = sitemap();
  it("every page has a Spanish twin, and plan pages for both areas are listed", () => {
    expect(s.length).toBeGreaterThan(300);
    for (const e of s) expect(e.alternates?.languages?.es).toBeTruthy();
    expect(s.some((e) => e.url.includes("/plan/") && e.url.includes("area=dallas"))).toBe(true);
    expect(s.some((e) => e.url.endsWith("/demo"))).toBe(false);
  });
  it("no URL is listed twice", () => {
    expect(new Set(s.map((e) => e.url)).size).toBe(s.length);
  });
  it("no raw & (Next writes URLs into the XML as-is; a raw & makes the whole file invalid)", () => {
    const all = s.flatMap((e) => [e.url, ...Object.values(e.alternates?.languages ?? {})]).join(" ");
    expect(all).not.toMatch(/&(?!amp;)/);
  });
});
