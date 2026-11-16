import { describe, expect, it } from "vitest";
import { GET } from "./route";

const get = (q: string) => GET(new Request(`http://x/api/remind?${q}`));

describe("/api/remind", () => {
  it("a calendar file, named in the visitor's language", async () => {
    const en = await get("end=2031-03-14&plan=Simple%20Saver%203");
    expect(en.headers.get("content-type")).toMatch(/text\/calendar/);
    expect(en.headers.get("content-disposition")).toBe('attachment; filename="wattch-reminder-2031-03-14.ics"');
    const es = await get("end=2031-03-14&lang=es");
    expect(es.headers.get("content-disposition")).toBe('attachment; filename="wattch-recordatorio-2031-03-14.ics"');
    expect(await es.text()).toContain("SUMMARY:Busca un nuevo plan de luz");
  });
  it("a bad date is a plain 400 in the visitor's language, never a file", async () => {
    const r = await get("end=2031-02-30&lang=es");
    expect(r.status).toBe(400);
    expect(r.headers.get("content-disposition")).toBeNull();
    expect(await r.text()).toMatch(/no parece una fecha/);
    expect((await get("end=2031-03-14%22%3B%20x%3D1")).status).toBe(400); // nothing odd ever reaches the file name
  });
});
