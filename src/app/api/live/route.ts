import { NextResponse } from "next/server";
import { planById } from "@/lib/plans/data";
import { fetchEfl } from "@/lib/reader/fetchEfl";
import { ptcAveragesOnLabel } from "@/lib/reader/templates";

export const maxDuration = 60;

/**
 * Re-fetches one plan's fine print right now and says whether it changed since Wattch read it. No AI call, no cost.
 * same: the file is byte-for-byte the one we read. pricesSame: the file differs (often just a new print date),
 * but the three average prices we checked are still printed in its price row.
 */
const MSG = {
  en: { unknown: "We don't know that plan.", down: "Couldn't open the provider's label right now. Try again in a minute.",
    gone: "The provider's link to this label is broken right now (the state's site links to the same file). Wattch's numbers come from the copy it read earlier." },
  es: { unknown: "No conocemos ese plan.", down: "No pudimos abrir la etiqueta del proveedor ahora. Intenta de nuevo en un minuto.",
    gone: "El enlace del proveedor a esta etiqueta no funciona ahora (el sitio del estado enlaza al mismo archivo). Los números de Wattch salen de la copia que leyó antes." },
} as const;

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const id = sp.get("id") ?? "";
  const m = MSG[sp.get("lang") === "es" ? "es" : "en"];
  const rec = planById(id);
  if (!rec) return NextResponse.json({ ok: false, message: m.unknown }, { status: 404 });
  try {
    const f = await fetchEfl(rec.meta.eflUrl, { anakinKey: process.env.ANAKIN_API_KEY, timeoutMs: 15000 });
    const same = f.sha256 === rec.read.sha256;
    const pricesSame = same || (rec.pricing ? ptcAveragesOnLabel(f.text, rec.pricing.labelAvg) : false);
    // one minute at the CDN: repeat clicks (or a crowd at a demo) don't re-download the provider's file every time
    return NextResponse.json({ ok: true, via: f.via, ms: f.ms, same, pricesSame, readAt: rec.read.fetchedAt },
      { headers: { "Cache-Control": "public, s-maxage=60" } });
  } catch {
    // plain words only — never a raw error from the provider's site. A file that's gone (404/410) isn't "try again later".
    const gone = await fetch(rec.meta.eflUrl, { method: "GET", redirect: "follow", signal: AbortSignal.timeout(8000) })
      .then((r) => r.status === 404 || r.status === 410).catch(() => false);
    return NextResponse.json({ ok: false, gone, message: gone ? m.gone : m.down }, { status: 200 });
  }
}
