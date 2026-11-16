import { ImageResponse } from "next/og";
import { clientPlans } from "@/lib/plans/data";
import { anyFilter, filterOpts, parseWallParams } from "@/lib/params";
import { AREAS } from "@/lib/plans/ptc";
import { rank, reveal, whyLine } from "@/lib/rank";
import { providerTitle } from "@/lib/names";

const W = {
  en: { mine: "My own 12 months", perMonth: (k: string) => `${k} kWh a month`, filtered: " · filtered", more: "more a year on the plan the state site lists first.", best: "My best plan", my1: (n: string, d: string) => `My #1: ${n} · ${d}/yr`,
    advertised: (c: number) => `Advertised at ${c}¢ — really`, perYear: "/yr", rankOf: (i: number, n: number) => `#${i} of ${n} plans for this home`, vsBest: (d: string) => `${d} a year more than the best plan`, isBest: "The cheapest plan for this home", nearBest: "about the same as the best plan" },
  es: { mine: "Mis propios 12 meses", perMonth: (k: string) => `${k} kWh al mes`, filtered: " · con filtros", more: "más al año con el plan que el sitio del estado pone primero.", best: "Mi mejor plan", my1: (n: string, d: string) => `Mi #1: ${n} · ${d}/año`,
    advertised: (c: number) => `Anunciado a ${c}¢ — en realidad`, perYear: "/año", rankOf: (i: number, n: number) => `#${i} de ${n} planes para este hogar`, vsBest: (d: string) => `${d} al año más que el mejor plan`, isBest: "El plan más barato para este hogar", nearBest: "casi lo mismo que el mejor plan" },
} as const;

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** Share card for one result (1200×630). Every number is computed here by the same code as the page. */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const { kwh, seasons, months, filters, withConditional, area, lang } = parseWallParams((k) => sp.get(k));
  const r = reveal(clientPlans(area), kwh, { seasons, months, area, includeConditional: withConditional, ...filterOpts(filters) });
  const big = r.pick && r.gap >= 1;
  const t = W[lang];
  const why = r.pick ? whyLine(r.pick.plan.pricing!, r.pick.months, lang) : null;
  // ?plan=<id> (plan pages): that plan's real cost and rank, when it's ranked; otherwise the general card below
  const opts = { seasons, months, area, includeConditional: withConditional, ...filterOpts(filters) };
  const planId = sp.get("plan");
  const ranked = planId ? rank(clientPlans(area), kwh, opts) : [];
  const at = ranked.findIndex((x) => x.plan.id === planId);
  if (at >= 0) return planCard(ranked, at, t, `${months ? t.mine : t.perMonth(kwh.toLocaleString("en-US"))} · ${AREAS[area].city}${anyFilter(filters) ? t.filtered : ""}`);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#1b1611", color: "#f5efe3", padding: "56px 64px", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 800 }}>⚡ Wattch</div>
          <div style={{ display: "flex", fontSize: 26, color: "#ffcf2e" }}>{months ? t.mine : t.perMonth(kwh.toLocaleString("en-US"))} · {AREAS[area].city}{anyFilter(filters) ? t.filtered : ""}</div>
        </div>
        {big ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 168, fontWeight: 800, color: "#ffcf2e", lineHeight: 1 }}>{money(r.gap)}</div>
            <div style={{ display: "flex", fontSize: 44, fontWeight: 700, marginTop: 12 }}>{t.more}</div>
            {why && <div style={{ display: "flex", fontSize: 28, marginTop: 18, color: "#d9cfbf" }}>{why}</div>}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 40, color: "#ffcf2e" }}>{t.best}</div>
            <div style={{ display: "flex", fontSize: 80, fontWeight: 800, lineHeight: 1.05 }}>{r.best?.plan.planName ?? "—"}</div>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#d9cfbf" }}>
          <div style={{ display: "flex" }}>{r.best ? t.my1(r.best.plan.planName, money(r.best.annual)) : ""}</div>
          <div style={{ display: "flex" }}>getwattch.vercel.app</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=3600" } },
  );
}

const SIZE = { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=3600" } };

/** One plan's card: what it's advertised at, what it really costs this home, and where it ranks. */
function planCard(ranked: ReturnType<typeof rank>, at: number, t: (typeof W)["en" | "es"], top: string) {
  const me = ranked[at], gap = Math.round(me.annual - ranked[0].annual);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#1b1611", color: "#f5efe3", padding: "56px 64px", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 800 }}>⚡ Wattch</div>
          <div style={{ display: "flex", fontSize: 26, color: "#ffcf2e" }}>{top}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 800, lineHeight: 1.05 }}>{me.plan.planName}</div>
          <div style={{ display: "flex", alignItems: "baseline", marginTop: 18 }}>
            <div style={{ display: "flex", fontSize: 36, color: "#d9cfbf" }}>{t.advertised(me.plan.ptc.k1000)}</div>
            <div style={{ display: "flex", fontSize: 96, fontWeight: 800, color: "#ffcf2e", marginLeft: 18, lineHeight: 1 }}>{money(me.annual)}</div>
            <div style={{ display: "flex", fontSize: 36, color: "#d9cfbf" }}>{t.perYear}</div>
          </div>
          <div style={{ display: "flex", fontSize: 32, marginTop: 18 }}>{at === 0 ? t.isBest : `${t.rankOf(at + 1, ranked.length)} · ${gap >= 1 ? t.vsBest(money(gap)) : t.nearBest}`}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#d9cfbf" }}>
          <div style={{ display: "flex" }}>{providerTitle(me.plan.provider)}</div>
          <div style={{ display: "flex" }}>getwattch.vercel.app</div>
        </div>
      </div>
    ),
    SIZE,
  );
}
