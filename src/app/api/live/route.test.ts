import { beforeEach, describe, expect, it, vi } from "vitest";

// No network, no real data file: the plan list and the label fetcher are stand-ins.
const plan = {
  meta: { id: "p1", eflUrl: "https://example.test/efl.pdf" },
  read: { sha256: "abc", fetchedAt: "2026-11-15T07:00:00Z" },
  pricing: { labelAvg: { k500: 19.2, k1000: 6.2, k2000: 12.2 } },
};
vi.mock("@/lib/plans/data", () => ({ planById: (id: string) => (id === "p1" ? plan : undefined) }));
const fetchEfl = vi.fn();
let siteDown = false;
vi.mock("@/lib/reader/fetchEfl", () => ({
  fetchEfl: async (...a: unknown[]) => {
    if (siteDown) throw new Error("ECONNRESET socket hang up at TLSSocket");
    return fetchEfl(...a);
  },
}));

const { GET } = await import("./route");
const call = async (id: string) => { const r = await GET(new Request(`http://x/api/live?id=${id}`)); return { status: r.status, body: await r.json() }; };

describe("/api/live — check one label again", () => {
  beforeEach(() => fetchEfl.mockReset());

  it("unknown plan → 404 with a plain message", async () => {
    const r = await call("nope");
    expect(r.status).toBe(404);
    expect(r.body).toEqual({ ok: false, message: "We don't know that plan." });
    expect(fetchEfl).not.toHaveBeenCalled();
  });

  it("same file → same and pricesSame", async () => {
    fetchEfl.mockResolvedValue({ sha256: "abc", text: "", via: "direct", ms: 120 });
    const r = await call("p1");
    expect(r.body).toMatchObject({ ok: true, same: true, pricesSame: true, via: "direct", readAt: plan.read.fetchedAt });
  });

  it("new file that still prints the same three prices → not same, pricesSame", async () => {
    fetchEfl.mockResolvedValue({ sha256: "new", text: "Average price per kWh 19.2¢ 6.2¢ 12.2¢ printed today", via: "anakin", ms: 900 });
    const r = await call("p1");
    expect(r.body).toMatchObject({ ok: true, same: false, pricesSame: true });
  });

  it("new file with different prices → pricesSame false", async () => {
    fetchEfl.mockResolvedValue({ sha256: "new", text: "Average price per kWh 18.0¢ 7.1¢ 12.9¢", via: "direct", ms: 100 });
    const r = await call("p1");
    expect(r.body).toMatchObject({ ok: true, same: false, pricesSame: false });
  });

  it("provider site down → friendly message, never the raw error", async () => {
    siteDown = true;
    const r = await call("p1");
    siteDown = false;
    expect(r.body.ok).toBe(false);
    expect(r.body.message).not.toMatch(/ECONNRESET|socket/);
    expect(r.body.message).toMatch(/Try again/);
  });

  it("?lang=es → the same plain messages in Spanish", async () => {
    const unknown = await (await GET(new Request("http://x/api/live?id=nope&lang=es"))).json();
    expect(unknown.message).toBe("No conocemos ese plan.");
    siteDown = true;
    const down = await (await GET(new Request("http://x/api/live?id=p1&lang=es"))).json();
    siteDown = false;
    expect(down.message).toMatch(/^No pudimos abrir la etiqueta del proveedor ahora/);
  });
});
