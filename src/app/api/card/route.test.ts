import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { GET } = await import("./route");

const png = async (q: string) => {
  const r = await GET(new Request(`http://x/api/card?${q}`));
  const body = new Uint8Array(await r.arrayBuffer());
  return { status: r.status, type: r.headers.get("content-type"), cache: r.headers.get("cache-control"), sig: [...body.slice(1, 4)].map((c) => String.fromCharCode(c)).join("") };
};

// Every share-card variant is a real PNG with the same cache header, including for bad or unknown input.
describe("/api/card", () => {
  for (const q of [
    "kwh=1100", "kwh=1100&lang=es&area=dallas", // general card
    "kwh=1100&plan=33633", "kwh=1100&plan=nope", // plan card / unknown plan → general
    "kwh=1100&a=37797&b=33633&lang=es", "kwh=1100&a=37797&b=17283", // compare / mixed areas → general
    "kwh=abc&area=xx&lang=fr&a=1&b=2&plan=", // nonsense
  ]) {
    it(q, async () => {
      const r = await png(q);
      expect(r.status).toBe(200);
      expect(r.type).toBe("image/png");
      expect(r.sig).toBe("PNG");
      expect(r.cache).toBe("public, max-age=3600");
    }, 30000);
  }
});
