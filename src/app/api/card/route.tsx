import { ImageResponse } from "next/og";
import { clientPlans } from "@/lib/plans/data";
import { anyFilter, filterOpts, parseWallParams } from "@/lib/params";
import { reveal } from "@/lib/rank";

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** Share card for one result (1200×630). Every number is computed here by the same code as the page. */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const { kwh, seasons, months, filters } = parseWallParams((k) => sp.get(k));
  const r = reveal(clientPlans(), kwh, { seasons, months, ...filterOpts(filters) });
  const big = r.pick && r.gap >= 1;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#1b1611", color: "#f5efe3", padding: "56px 64px", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 800 }}>⚡ Wattch</div>
          <div style={{ display: "flex", fontSize: 26, color: "#ffcf2e" }}>{months ? "My own 12 months" : `${kwh.toLocaleString()} kWh a month`} · Houston{anyFilter(filters) ? " · filtered" : ""}</div>
        </div>
        {big ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 168, fontWeight: 800, color: "#ffcf2e", lineHeight: 1 }}>{money(r.gap)}</div>
            <div style={{ display: "flex", fontSize: 44, fontWeight: 700, marginTop: 12 }}>more a year on the plan the state site lists first.</div>
            {r.why && <div style={{ display: "flex", fontSize: 28, marginTop: 18, color: "#d9cfbf" }}>{r.why}</div>}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 40, color: "#ffcf2e" }}>My best plan</div>
            <div style={{ display: "flex", fontSize: 80, fontWeight: 800, lineHeight: 1.05 }}>{r.best?.plan.planName ?? "—"}</div>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#d9cfbf" }}>
          <div style={{ display: "flex" }}>{r.best ? `My #1: ${r.best.plan.planName} · ${money(r.best.annual)}/yr` : ""}</div>
          <div style={{ display: "flex" }}>getwattch.vercel.app</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
