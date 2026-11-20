import { beforeEach, describe, expect, it, vi } from "vitest";

// No network, no real data file: the plan list and the label fetcher are stand-ins.
const plan = {
  meta: { id: "p1", eflUrl: "https://example.test/efl.pdf" },
  read: { sha256: "abc", fetchedAt: "2026-11-15T07:00:00Z" },
  pricing: { labelAvg: { k500: 19.2, k1000: 6.2, k2000: 12.2 } },
  check: { status: "verified" },
};
// a plan Wattch never managed to read (no fingerprint, no prices)
const unreadPlan = { meta: { id: "p2", eflUrl: "https://example.test/u.pdf" }, read: { sha256: "", fetchedAt: "2026-11-16T08:30:00Z" }, pricing: null, check: { status: "unread" } };
vi.mock("@/lib/plans/data", () => ({ planById: (id: string) => (id === "p1" ? plan : id === "p2" ? unreadPlan : undefined) }));
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
  // the "is the file gone?" look after a failure: by default the provider answers 503 (just down)
  let linkStatus = 503;
  beforeEach(() => { fetchEfl.mockReset(); linkStatus = 503; vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: linkStatus }))); });

  it("unknown plan → 404 with a plain message", async () => {
    const r = await call("nope");
    expect(r.status).toBe(404);
    expect(r.body).toEqual({ ok: false, message: "We don't know that plan." });
    expect(fetchEfl).not.toHaveBeenCalled();
  });

  it("never-read plan → says there's nothing to compare yet, and doesn't open the label (EN + ES)", async () => {
    const r = await call("p2");
    expect(r.body).toEqual({ ok: false, message: "Wattch hasn't read this label's prices yet, so there's nothing to compare it with." });
    const es = await (await GET(new Request("http://x/api/live?id=p2&lang=es"))).json();
    expect(es.message).toMatch(/todavía no ha leído/);
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
    expect(r.body).toMatchObject({ ok: true, same: false, pricesSame: true, fileKnown: true });
  });

  it("hand-read label with no stored fingerprint → fileKnown false (can't call the file new), prices still compared", async () => {
    const before = plan.read.sha256;
    plan.read.sha256 = "";
    try {
      fetchEfl.mockResolvedValue({ sha256: "x", text: "Average price per kWh 19.2¢ 6.2¢ 12.2¢", via: "direct", ms: 300 });
      const r = await call("p1");
      expect(r.body).toMatchObject({ ok: true, same: false, pricesSame: true, fileKnown: false });
    } finally { plan.read.sha256 = before; }
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

  it("label file gone (404) → says the link is broken, not 'try again' (EN + ES)", async () => {
    siteDown = true; linkStatus = 404;
    const en = await call("p1");
    const es = await (await GET(new Request("http://x/api/live?id=p1&lang=es"))).json();
    siteDown = false;
    expect(en.body).toMatchObject({ ok: false, gone: true });
    expect(en.body.message).toMatch(/label file isn.t there right now/);
    expect(en.body.message).not.toMatch(/Try again/);
    expect(es.message).toMatch(/^El archivo de la etiqueta del proveedor no está ahora/);
  });

  it("a good answer is shared by the CDN for a minute; a failure never is", async () => {
    fetchEfl.mockResolvedValue({ sha256: "abc", text: "", via: "direct", ms: 120 });
    expect((await GET(new Request("http://x/api/live?id=p1"))).headers.get("cache-control")).toBe("public, s-maxage=60");
    siteDown = true;
    const bad = await GET(new Request("http://x/api/live?id=p1"));
    siteDown = false;
    expect(bad.headers.get("cache-control") ?? "").not.toMatch(/s-maxage/);
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
