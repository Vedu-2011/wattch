import { ImageResponse } from "next/og";
import { compareYear } from "@/lib/compare";
import { areaOf, clientPlans, planById } from "@/lib/plans/data";
import { anyFilter, filterOpts, parseWallParams } from "@/lib/params";
import { AREAS } from "@/lib/plans/ptc";
import { reveal, standing, whyLine, yearFor } from "@/lib/rank";
import { providerTitle } from "@/lib/names";

const W = {
  en: { mine: "My own 12 months", perMonth: (k: string) => `${k} kWh a month`, filtered: " · filtered", more: "more a year on the plan the state site lists first.", best: "My best plan", my1: (n: string, d: string) => `My #1: ${n} · ${d}/yr`,
    advertised: (c: number) => `Advertised at ${c}¢ — really`, perYear: "/yr", rankOf: (i: number, n: number) => `#${i} of ${n} plans for this home`, vsBest: (d: string) => `${d} a year more than the best plan`, isBest: "The cheapest plan for this home", nearBest: "about the same as the best plan",
    saves: (d: string) => `saves ${d} a year`, sameCost: "Same yearly cost", over: (n: string) => `over ${n}` },
  es: { mine: "Mis propios 12 meses", perMonth: (k: string) => `${k} kWh al mes`, filtered: " · con filtros", more: "más al año con el plan que el sitio del estado pone primero.", best: "Mi mejor plan", my1: (n: string, d: string) => `Mi #1: ${n} · ${d}/año`,
    advertised: (c: number) => `Anunciado a ${c}¢ — en realidad`, perYear: "/año", rankOf: (i: number, n: number) => `#${i} de ${n} planes para este hogar`, vsBest: (d: string) => `${d} al año más que el mejor plan`, isBest: "El plan más barato para este hogar", nearBest: "casi lo mismo que el mejor plan",
    saves: (d: string) => `ahorra ${d} al año`, sameCost: "El mismo costo al año", over: (n: string) => `frente a ${n}` },
} as const;

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** Share card for one result (1200×630). Every number is computed here by the same code as the page. */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const { kwh, seasons, months, filters, withConditional, area, lang } = parseWallParams((k) => sp.get(k));
  const t = W[lang];
  const opts = { seasons, months, area, includeConditional: withConditional, ...filterOpts(filters) };
  // ?plan=<id> (plan pages): that plan's real cost and rank, when it's ranked; otherwise the general card below
  const planId = sp.get("plan");
  const st = planId ? standing(clientPlans(area), planId, kwh, opts) : null;
  // ?a=&b= (compare pages): the same yearly totals the compare page shows, when both plans exist in the same area
  const pa = planById(sp.get("a") ?? ""), pb = planById(sp.get("b") ?? "");
  if (!planId && pa?.pricing && pb?.pricing && areaOf(pa.meta.id) === areaOf(pb.meta.id)) {
    const ar = areaOf(pa.meta.id) ?? "houston";
    const c = compareYear(pa.pricing, pb.pricing, months ?? yearFor(kwh, seasons, ar), { includeConditional: withConditional });
    return compareCard(c, pa.meta.planName, pb.meta.planName, t, `${months ? t.mine : t.perMonth(kwh.toLocaleString("en-US"))} · ${AREAS[ar].city}`);
  }
  if (st) return planCard(st, t, `${months ? t.mine : t.perMonth(kwh.toLocaleString("en-US"))} · ${AREAS[area].city}${anyFilter(filters) ? t.filtered : ""}`);
  // the general card: the state site's #1 vs your best (only computed when no plan/compare card was returned)
  const r = reveal(clientPlans(area), kwh, opts);
  const big = r.pick && r.gap >= 1;
  const why = r.pick ? whyLine(r.pick.plan.pricing!, r.pick.months, lang) : null;
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
    SIZE,
  );
}

const SIZE = { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=3600" } };

/** One plan's card: what it's advertised at, what it really costs this home, and where it ranks. */
function planCard(st: NonNullable<ReturnType<typeof standing>>, t: (typeof W)["en" | "es"], top: string) {
  const { me, position, of } = st, gap = Math.round(st.gap);
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
          <div style={{ display: "flex", fontSize: 32, marginTop: 18 }}>{position === 1 ? t.isBest : `${t.rankOf(position, of)} · ${gap >= 1 ? t.vsBest(money(gap)) : t.nearBest}`}</div>
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

/** Two plans side by side: who saves what over the year (compareYear, same as the compare page). */
function compareCard(c: ReturnType<typeof compareYear>, nameA: string, nameB: string, t: (typeof W)["en" | "es"], top: string) {
  const d = Math.round(Math.abs(c.diff));
  const [win, lose] = c.diff > 0 ? [nameA, nameB] : [nameB, nameA];
  const box = (name: string, total: number, hot: boolean) => (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "22px 26px", borderRadius: 24, background: hot ? "#ffcf2e" : "#2e2620", color: hot ? "#1b1611" : "#f5efe3" }}>
      <div style={{ display: "flex", fontSize: 30, fontWeight: 700 }}>{name}</div>
      <div style={{ display: "flex", fontSize: 56, fontWeight: 800, marginTop: 6 }}>{money(total)}{t.perYear}</div>
    </div>
  );
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#1b1611", color: "#f5efe3", padding: "56px 64px", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 800 }}>⚡ Wattch</div>
          <div style={{ display: "flex", fontSize: 26, color: "#ffcf2e" }}>{top}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {d >= 1
            ? <div style={{ display: "flex", flexWrap: "wrap", fontSize: 52, fontWeight: 800, lineHeight: 1.15 }}><span style={{ color: "#ffcf2e" }}>{win}</span>&nbsp;{t.saves(money(d))}</div>
            : <div style={{ display: "flex", fontSize: 52, fontWeight: 800 }}>{t.sameCost}</div>}
          {d >= 1 && <div style={{ display: "flex", fontSize: 30, color: "#d9cfbf", marginTop: 8 }}>{t.over(lose)}</div>}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", gap: 20 }}>
            {box(nameA, c.totalA, c.diff > 0)}
            {box(nameB, c.totalB, c.diff < 0)}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", fontSize: 26, color: "#d9cfbf", marginTop: 18 }}>getwattch.vercel.app</div>
        </div>
      </div>
    ),
    SIZE,
  );
}
