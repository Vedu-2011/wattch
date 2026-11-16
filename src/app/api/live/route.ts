import { NextResponse } from "next/server";
import { planById } from "@/lib/plans/data";
import { fetchEfl, plainLabelUrl } from "@/lib/reader/fetchEfl";
import { ptcAveragesOnLabel } from "@/lib/reader/templates";

export const maxDuration = 60;

/**
 * Re-fetches one plan's fine print right now and says whether it changed since Wattch read it. No AI call, no cost.
 * same: the file is byte-for-byte the one we read. pricesSame: the file differs (often just a new print date),
 * but the three average prices we checked are still printed in its price row.
 */
const MSG = {
  en: { unknown: "We don't know that plan.", down: "Couldn't open the provider's label right now. Try again in a minute.",
    gone: "The provider's label file isn't there right now (its link answers \"not found\"). Wattch's numbers come from the copy it read earlier.",
    unread: "Wattch hasn't read this label's prices yet, so there's nothing to compare it with." },
  es: { unknown: "No conocemos ese plan.", down: "No pudimos abrir la etiqueta del proveedor ahora. Intenta de nuevo en un minuto.",
    gone: "El archivo de la etiqueta del proveedor no está ahora (su enlace dice \"no encontrado\"). Los números de Wattch salen de la copia que leyó antes.",
    unread: "Wattch todavía no ha leído los precios de esta etiqueta, así que no hay nada con qué compararla." },
} as const;

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const id = sp.get("id") ?? "";
  const m = MSG[sp.get("lang") === "es" ? "es" : "en"];
  const rec = planById(id);
  if (!rec) return NextResponse.json({ ok: false, message: m.unknown }, { status: 404 });
  // never read (no fingerprint): "it changed since Wattch read it" would be false, and opening it can cost a paid read
  if (rec.check.status === "unread" || !rec.read.sha256) return NextResponse.json({ ok: false, message: m.unread });
  try {
    const f = await fetchEfl(rec.meta.eflUrl, { anakinKey: process.env.ANAKIN_API_KEY, timeoutMs: 15000 });
    const same = f.sha256 === rec.read.sha256;
    const pricesSame = same || (rec.pricing ? ptcAveragesOnLabel(f.text, rec.pricing.labelAvg) : false);
    // one minute at the CDN: repeat clicks (or a crowd at a demo) don't re-download the provider's file every time
    return NextResponse.json({ ok: true, via: f.via, ms: f.ms, same, pricesSame, readAt: rec.read.fetchedAt },
      { headers: { "Cache-Control": "public, s-maxage=60" } });
  } catch {
    // plain words only — never a raw error from the provider's site. A file that's gone (404/410) isn't "try again later".
    // look at both the link people click and the address the download actually used (plainLabelUrl rewrites some)
    const notFound = (u: string) => fetch(u, { method: "GET", redirect: "follow", signal: AbortSignal.timeout(8000) })
      .then((r) => r.status === 404 || r.status === 410).catch(() => false);
    const urls = [...new Set([rec.meta.eflUrl, (() => { try { return plainLabelUrl(rec.meta.eflUrl); } catch { return rec.meta.eflUrl; } })()])];
    const gone = (await Promise.all(urls.map(notFound))).some(Boolean);
    return NextResponse.json({ ok: false, gone, message: gone ? m.gone : m.down }, { status: 200 });
  }
}
