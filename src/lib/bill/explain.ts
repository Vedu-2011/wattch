import type { Lang } from "@/lib/i18n";
import type { PlanPricing } from "@/lib/plans/schema";
import { billLines } from "./index";

/**
 * "Why is my bill this much?" — one plain sentence per bill line, written by code from the plan's own numbers.
 * Keys match billLines() so the page can put each sentence under its line. Plus "missed" sentences for credits the
 * usage just misses (the trap people don't see coming). English or Spanish; same numbers either way.
 */
export type LineWhy = { key: string; text: string };

const $ = (d: number) => `$${d.toFixed(2)}`;
const n = (k: number) => k.toLocaleString("en-US");
/** cents as the label prints them (up to 4 decimals, e.g. CenterPoint's 6.5611¢) */
const c = (x: number) => `${Number(x.toFixed(4))}¢`;

const S = {
  en: {
    tou: (parts: string) => `Priced by time of day, using the label's own mix: ${parts}. Your mix may differ.`,
    touPart: (pct: number, cents: string, label: string) => `${pct}% at ${cents} (${label})`,
    flat: (kwh: string, cents: string) => `${kwh} kWh × ${cents}, the provider's price for the power itself.`,
    tierPart: (first: boolean, k: string, cents: string) => `${first ? "the first" : "the next"} ${k} kWh at ${cents}`,
    tiers: (parts: string[]) => `This plan changes price as you use more: ${parts.join(", then ")}.`,
    base: (d: string) => `A flat ${d} from the provider every month, however much you use.`,
    noBase: "This plan has no monthly base charge.",
    tduKwh: (kwh: string, cents: string, u: string) => `${kwh} kWh × ${cents} for ${u}'s wires to your home. The provider passes this on.`,
    tduFolded: (u: string) => `This plan's label folds ${u}'s delivery charges into its other prices, so there's no separate line.`,
    tduMonthly: (u: string) => `${u}'s flat monthly delivery fee, passed on by the provider.`,
    noTduMonthly: "No separate monthly delivery fee on this plan's label.",
    feeZero: "The label lists this fee at $0, so it costs nothing.",
    fee: (below: string, d: string, more: string) => `You used under ${below} kWh, so this plan adds ${d}. Use ${more} kWh more and it goes away.`,
    amort: (d: string, m: number) => `A one-time ${d} charge, spread over ${m} months the same way the label counts it.`,
    atLeast: (k: string) => `at least ${k} kWh`,
    between: (a: string, b: string) => `between ${a} and ${b} kWh`,
    credit: (range: string, d: string, cond: boolean) => `You used ${range}, so you get ${d} off${cond ? ", only if you meet the label's extra condition (like autopay)" : ""}.`,
    missedLow: (d: string, min: string, more: string) => `Missed: ${d} off needs ${min} kWh. That's ${more} kWh more than this month.`,
    missedHigh: (d: string, max: string, over: string) => `Missed: ${d} off stops above ${max} kWh. You used ${over} kWh too many for it.`,
  },
  es: {
    tou: (parts: string) => `Precio según la hora del día, con la mezcla que usa la etiqueta: ${parts}. Tu mezcla puede ser otra.`,
    touPart: (pct: number, cents: string, label: string) => `${pct}% a ${cents} (${label})`,
    flat: (kwh: string, cents: string) => `${kwh} kWh × ${cents}, el precio del proveedor por la luz en sí.`,
    tierPart: (first: boolean, k: string, cents: string) => `${first ? "los primeros" : "los siguientes"} ${k} kWh a ${cents}`,
    tiers: (parts: string[]) => `Este plan cambia de precio mientras más usas: ${parts.join(", luego ")}.`,
    base: (d: string) => `Un cargo fijo de ${d} del proveedor cada mes, sin importar cuánto uses.`,
    noBase: "Este plan no tiene cargo base mensual.",
    tduKwh: (kwh: string, cents: string, u: string) => `${kwh} kWh × ${cents} por los cables de ${u} hasta tu casa. El proveedor te lo pasa.`,
    tduFolded: (u: string) => `La etiqueta de este plan incluye los cargos de entrega de ${u} en sus otros precios, así que no hay una línea aparte.`,
    tduMonthly: (u: string) => `El cargo fijo mensual de entrega de ${u}, que el proveedor te pasa.`,
    noTduMonthly: "La etiqueta de este plan no tiene un cargo mensual de entrega aparte.",
    feeZero: "La etiqueta pone este cargo en $0, así que no cuesta nada.",
    fee: (below: string, d: string, more: string) => `Usaste menos de ${below} kWh, así que este plan suma ${d}. Usa ${more} kWh más y desaparece.`,
    amort: (d: string, m: number) => `Un cargo único de ${d}, repartido en ${m} meses igual que lo cuenta la etiqueta.`,
    atLeast: (k: string) => `al menos ${k} kWh`,
    between: (a: string, b: string) => `entre ${a} y ${b} kWh`,
    credit: (range: string, d: string, cond: boolean) => `Usaste ${range}, así que te descuentan ${d}${cond ? ", solo si cumples la condición extra de la etiqueta (como el pago automático)" : ""}.`,
    missedLow: (d: string, min: string, more: string) => `Te lo perdiste: el descuento de ${d} pide ${min} kWh. Son ${more} kWh más que este mes.`,
    missedHigh: (d: string, max: string, over: string) => `Te lo perdiste: el descuento de ${d} se acaba arriba de ${max} kWh. Usaste ${over} kWh de más.`,
  },
} as const;

type Words = (typeof S)[Lang];

function energyWhy(p: PlanPricing, kwh: number, W: Words): string {
  if (p.touPeriods.length > 0) return W.tou(p.touPeriods.map((t) => W.touPart(Math.round(t.share * 100), c(t.cents), t.label)).join(", "));
  const tiers = [...p.energyTiers].sort((a, b) => a.fromKwh - b.fromKwh);
  if (tiers.length === 1) return W.flat(n(kwh), c(tiers[0].cents));
  const used = tiers.filter((t) => kwh > t.fromKwh);
  const parts = used.map((t, i) => {
    const next = tiers[tiers.indexOf(t) + 1];
    const top = next ? Math.min(kwh, next.fromKwh) : kwh;
    return W.tierPart(i === 0, n(top - t.fromKwh), c(t.cents));
  });
  return W.tiers(parts);
}

export function explainBill(p: PlanPricing, kwh: number, opts: { includeConditional?: boolean; utility?: string; lang?: Lang } = {}): LineWhy[] {
  const utility = opts.utility ?? "CenterPoint";
  const W: Words = S[opts.lang ?? "en"];
  const out: LineWhy[] = billLines(p, kwh, opts).map((l) => {
    if (l.key === "energy") return { key: l.key, text: energyWhy(p, kwh, W) };
    if (l.key === "base") return { key: l.key, text: p.baseChargeDollars > 0 ? W.base($(p.baseChargeDollars)) : W.noBase };
    if (l.key === "tduKwh") return { key: l.key, text: p.tduCentsPerKwh > 0 ? W.tduKwh(n(kwh), c(p.tduCentsPerKwh), utility) : W.tduFolded(utility) };
    if (l.key === "tduMonthly") return { key: l.key, text: p.tduMonthlyDollars > 0 ? W.tduMonthly(utility) : W.noTduMonthly };
    if (l.key.startsWith("fee-")) {
      const f = p.usageFees[Number(l.key.slice(4))];
      return { key: l.key, text: f.dollars === 0 ? W.feeZero : W.fee(n(f.belowKwh), $(f.dollars), n(f.belowKwh - kwh)) };
    }
    if (l.key.startsWith("amort-")) {
      const f = p.amortizedFees[Number(l.key.slice(6))];
      return { key: l.key, text: W.amort($(f.dollars), f.months) };
    }
    if (l.key.startsWith("credit-")) {
      const cr = p.credits[Number(l.key.slice(7))];
      const range = cr.maxKwh === null ? W.atLeast(n(cr.minKwh)) : W.between(n(cr.minKwh), n(cr.maxKwh));
      return { key: l.key, text: W.credit(range, $(cr.dollars), cr.conditional) };
    }
    return { key: l.key, text: "" };
  });
  // credits this month just misses
  p.credits.forEach((cr, i) => {
    if (cr.conditional && opts.includeConditional === false) return;
    if (kwh < cr.minKwh) out.push({ key: `missed-${i}`, text: W.missedLow($(cr.dollars), n(cr.minKwh), n(cr.minKwh - kwh)) });
    else if (cr.maxKwh !== null && kwh > cr.maxKwh) out.push({ key: `missed-${i}`, text: W.missedHigh($(cr.dollars), n(cr.maxKwh), n(kwh - cr.maxKwh)) });
  });
  return out;
}
