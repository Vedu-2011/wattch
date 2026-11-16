"use client";
import { useMemo, useState } from "react";
import { findCliffs, monthlyBill } from "@/lib/bill";
import type { Lang } from "@/lib/i18n";
import type { PlanPricing } from "@/lib/plans/schema";

/** Monthly bill vs. usage. A bill-credit plan shows a cliff: use one kWh less and the bill jumps up. */
export function CliffChart({ pricing, kwh, lang = "en" }: { pricing: PlanPricing; kwh: number; lang?: Lang }) {
  const es = lang === "es";
  const W = 640, H = 260, pad = { l: 52, r: 16, t: 16, b: 36 };
  const [hover, setHover] = useState<number | null>(null);
  const pts = useMemo(() => {
    const out: { k: number; b: number }[] = [];
    for (let k = 200; k <= 2600; k += 5) out.push({ k, b: monthlyBill(pricing, k) });
    return out;
  }, [pricing]);
  const cliffs = useMemo(() => findCliffs(pricing, 200, 2600, 5), [pricing]);
  const maxB = Math.max(...pts.map((p) => p.b)) * 1.08;
  const x = (k: number) => pad.l + ((k - 200) / 2400) * (W - pad.l - pad.r);
  const y = (b: number) => H - pad.b - (b / maxB) * (H - pad.t - pad.b);
  // break the line at cliffs so the jump reads as a jump
  let d = "";
  pts.forEach((p, i) => {
    const prev = pts[i - 1];
    const jump = prev && Math.abs(p.b - prev.b) > 4;
    d += `${i === 0 || jump ? "M" : "L"}${x(p.k).toFixed(1)},${y(p.b).toFixed(1)} `;
  });
  const h = hover ?? kwh;
  const hb = monthlyBill(pricing, h);
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
        aria-label={es ? `Factura mensual de 200 a 2,600 kWh.${cliffs.length ? ` Salto de precio en ${cliffs.map((c) => c.kwh).join(" y ")} kWh.` : ""}` : `Monthly bill from 200 to 2,600 kWh.${cliffs.length ? ` Price cliff at ${cliffs.map((c) => c.kwh).join(" and ")} kWh.` : ""}`}
        onMouseMove={(e) => {
          const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const k = 200 + (((e.clientX - r.left) / r.width) * W - pad.l) / (W - pad.l - pad.r) * 2400;
          setHover(Math.max(200, Math.min(2600, Math.round(k / 10) * 10)));
        }}
        onMouseLeave={() => setHover(null)}>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}>
            <rect x={pad.l} y={y(maxB * f) - 0.5} width={W - pad.l - pad.r} height={1} fill="#1b1611" opacity={0.05} />
            <text x={pad.l - 8} y={y(maxB * f) + 4} textAnchor="end" className="num" fontSize="11" fill="#5b5145">${Math.round(maxB * f)}</text>
          </g>
        ))}
        {[500, 1000, 1500, 2000, 2500].map((k) => (
          <text key={k} x={x(k)} y={H - 12} textAnchor="middle" className="num" fontSize="11" fill="#5b5145">{k.toLocaleString("en-US")}</text>
        ))}
        {cliffs.map((c) => (
          <g key={c.kwh}>
            <rect x={x(c.kwh) - 14} y={pad.t} width={28} height={H - pad.t - pad.b} fill="#d6402b" opacity={0.08} rx={6} />
            <text x={x(c.kwh)} y={pad.t + 12} textAnchor="middle" fontSize="11" fontWeight="700" fill="#d6402b">{es ? "salto" : "cliff"}</text>
          </g>
        ))}
        <path d={d} fill="none" stroke="#1b1611" strokeWidth={2.5} strokeLinejoin="round" />
        <line x1={x(h)} x2={x(h)} y1={pad.t} y2={H - pad.b} stroke="#2f5fd0" strokeWidth={1.5} strokeDasharray="4 4" />
        <circle cx={x(h)} cy={y(hb)} r={5} fill="#ffcf2e" stroke="#1b1611" strokeWidth={2} />
      </svg>
      <figcaption className="mt-2 text-sm text-ink-2">
        {es
          ? <>Con <b className="num text-ink">{h.toLocaleString("en-US")} kWh</b> este plan cobra <b className="num text-ink">${hb.toFixed(2)}</b> antes de impuestos.</>
          : <>At <b className="num text-ink">{h.toLocaleString("en-US")} kWh</b> this plan bills <b className="num text-ink">${hb.toFixed(2)}</b> before taxes.</>}
        {cliffs.map((c) => (
          <span key={c.kwh} className="block text-over">
            {es
              ? <>Usa {(c.kwh - 1).toLocaleString("en-US")} kWh en vez de {c.kwh.toLocaleString("en-US")} y la factura {c.below > c.at ? "sube" : "baja"} de</>
              : <>Use {(c.kwh - 1).toLocaleString("en-US")} kWh instead of {c.kwh.toLocaleString("en-US")} and the bill goes {c.below > c.at ? "up" : "down"} from</>}
            <b className="num"> ${c.at.toFixed(2)}</b> {es ? "a" : "to"} <b className="num">${c.below.toFixed(2)}</b>.
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
