import { createHash } from "node:crypto";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36";

export type FetchedEfl = { text: string; via: "direct" | "anakin"; sha256: string; ms: number; finalUrl: string };

export class ReadError extends Error {}

function safeUrl(u: string): string {
  try {
    return new URL(u.trim().replace(/ /g, "%20")).toString();
  } catch {
    throw new ReadError("This plan's fine-print link is broken.");
  }
}

async function pdfText(bytes: Uint8Array): Promise<string> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(bytes);
  const { text } = await extractText(pdf, { mergePages: true });
  return text;
}

const looksLikeEfl = (t: string) => /average\s+(monthly\s+)?(use|usage)|average price/i.test(t) && /kwh/i.test(t);

/** Plain fetch first (free). If the page needs a real browser, or the site blocks us, ask Anakin.io to read it. */
export async function fetchEfl(rawUrl: string, opts: { anakinKey?: string; timeoutMs?: number } = {}): Promise<FetchedEfl> {
  const url = safeUrl(rawUrl);
  const t0 = Date.now();
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow", signal: AbortSignal.timeout(opts.timeoutMs ?? 25000) });
    const buf = new Uint8Array(await res.arrayBuffer());
    const isPdf = buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46;
    if (res.ok && isPdf) {
      const text = await pdfText(buf);
      if (looksLikeEfl(text)) return { text, via: "direct", sha256: sha(buf), ms: Date.now() - t0, finalUrl: res.url };
    }
  } catch {
    /* fall through to Anakin */
  }
  return anakinRead(url, t0, opts.anakinKey);
}

export async function anakinRead(url: string, t0 = Date.now(), key?: string): Promise<FetchedEfl> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (key) headers["X-API-Key"] = key;
  const res = await fetch("https://api.anakin.io/v1/url-scraper/scrape", {
    method: "POST", headers, body: JSON.stringify({ url }), signal: AbortSignal.timeout(110000),
  });
  if (!res.ok) throw new ReadError(res.status === 402 ? "Out of Anakin.io reads for now." : `Anakin.io couldn't open this page (${res.status}).`);
  const data = (await res.json()) as { markdown?: string; finalUrl?: string };
  const text = data.markdown ?? "";
  if (!looksLikeEfl(text)) throw new ReadError("The page opened, but it doesn't look like a fine-print label.");
  return { text, via: "anakin", sha256: sha(new TextEncoder().encode(text)), ms: Date.now() - t0, finalUrl: data.finalUrl ?? url };
}

function sha(b: Uint8Array) {
  return createHash("sha256").update(b).digest("hex");
}
