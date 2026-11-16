import { annualCost } from "@/lib/bill";
import type { Lang } from "@/lib/i18n";
import type { PlanPricing } from "@/lib/plans/schema";

/**
 * "Ask yourself before you sign": questions written by code from the plan's own fine print and your 12 months.
 * Each one points at a real number on the label. Most important first; at most `max`. English or Spanish.
 */
export type Question = { key: string; q: string; why: string };

const $ = (d: number) => `$${d.toLocaleString("en-US", { maximumFractionDigits: d % 1 ? 2 : 0, minimumFractionDigits: d % 1 ? 2 : 0 })}`;
const n = (k: number) => k.toLocaleString("en-US");
const s = (k: number, one: string, many: string) => (k === 1 ? one : many);

export const QUESTION_WORDS = {
  en: {
    orMore: (k: string) => `${k} kWh or more`,
    between: (a: string, b: string) => `between ${a} and ${b} kWh`,
    credit: (range: string) => `Will I use ${range} every single month?`,
    creditMiss: (d: string, m: number, all: string) => `The ${d} credit needs it. With your usage you'd miss it ${m} ${s(m, "month", "months")} a year, ${all} in all.`,
    creditOk: (d: string) => `The ${d} credit needs it. Your usage gets it every month, but a mild month or a trip could cost you ${d}.`,
    minfee: (k: string) => `Could I ever use less than ${k} kWh in a month (a trip, an empty house)?`,
    minfeeWhy: (d: string, k: string) => `This plan adds ${d} to any month under ${k} kWh.`,
    cond: (label: string) => `Am I okay with what the "${label}" needs, like autopay or paperless bills?`,
    condMore: (d: string) => `Without it, your year costs about ${d} more.`,
    condTied: "The label ties a discount to it.",
    short: (m: number) => `What will I pay after ${m} ${s(m, "month", "months")}?`,
    shortWhy: (m: number) => `This price only lasts ${m} ${s(m, "month", "months")}. After that the plan can change, so set a reminder to shop again.`,
    tou: (pct: number, label: string) => `Can I really move ${pct}% of my use into "${label}"?`,
    touWhy: "The label's price assumes that mix. Use less in those hours and you pay more.",
    tier: (k: string) => `How often do I go over ${k} kWh?`,
    tierWhy: (hi: number, lo: number) => `Every kWh above that costs ${hi}¢ instead of ${lo}¢.`,
    setup: (d: string, label: string) => `Am I okay paying a one-time ${d} for "${label}"?`,
    setupWhy: (m: number) => `The label's average price spreads it over ${m} months, so the sticker price doesn't show it all at once.`,
    exit: "Might I want to switch before the contract ends?",
    exitPer: (d: string) => `Leaving early costs ${d} for every month left.`,
    exitFlat: (d: string) => `Leaving early costs ${d}.`,
  },
  es: {
    orMore: (k: string) => `${k} kWh o más`,
    between: (a: string, b: string) => `entre ${a} y ${b} kWh`,
    credit: (range: string) => `¿Voy a usar ${range} todos los meses, sin falta?`,
    creditMiss: (d: string, m: number, all: string) => `El descuento de ${d} lo pide. Con tu consumo te lo perderías ${m} ${s(m, "mes", "meses")} al año, ${all} en total.`,
    creditOk: (d: string) => `El descuento de ${d} lo pide. Con tu consumo lo recibes cada mes, pero un mes templado o un viaje te puede costar ${d}.`,
    minfee: (k: string) => `¿Podría usar menos de ${k} kWh en algún mes (un viaje, la casa vacía)?`,
    minfeeWhy: (d: string, k: string) => `Este plan suma ${d} a cualquier mes con menos de ${k} kWh.`,
    cond: (label: string) => `¿Estoy de acuerdo con lo que pide "${label}", como el pago automático o la factura sin papel?`,
    condMore: (d: string) => `Sin eso, tu año cuesta unos ${d} más.`,
    condTied: "La etiqueta liga un descuento a eso.",
    short: (m: number) => `¿Cuánto voy a pagar después de ${m} ${s(m, "mes", "meses")}?`,
    shortWhy: (m: number) => `Este precio solo dura ${m} ${s(m, "mes", "meses")}. Después el plan puede cambiar, así que ponte un recordatorio para buscar otra vez.`,
    tou: (pct: number, label: string) => `¿De verdad puedo pasar el ${pct}% de mi consumo a "${label}"?`,
    touWhy: "El precio de la etiqueta supone esa mezcla. Si usas menos en esas horas, pagas más.",
    tier: (k: string) => `¿Qué tan seguido paso de ${k} kWh?`,
    tierWhy: (hi: number, lo: number) => `Cada kWh arriba de eso cuesta ${hi}¢ en vez de ${lo}¢.`,
    setup: (d: string, label: string) => `¿Estoy de acuerdo con pagar ${d} una sola vez por "${label}"?`,
    setupWhy: (m: number) => `El precio promedio de la etiqueta lo reparte en ${m} meses, así que el precio anunciado no lo muestra todo de una vez.`,
    exit: "¿Podría querer cambiarme antes de que termine el contrato?",
    exitPer: (d: string) => `Salirte antes cuesta ${d} por cada mes que falte.`,
    exitFlat: (d: string) => `Salirte antes cuesta ${d}.`,
  },
} as const;

export function questions(p: PlanPricing, months: number[], max = 4, lang: Lang = "en"): Question[] {
  const W = QUESTION_WORDS[lang];
  const out: Question[] = [];
  // bill credits that need a minimum usage: how many of YOUR months miss it
  for (const c of p.credits.filter((c) => !c.conditional && c.minKwh > 0).sort((a, b) => b.dollars - a.dollars)) {
    const miss = months.filter((m) => m < c.minKwh || (c.maxKwh !== null && m > c.maxKwh)).length;
    const range = c.maxKwh === null ? W.orMore(n(c.minKwh)) : W.between(n(c.minKwh), n(c.maxKwh));
    out.push({ key: "credit", q: W.credit(range), why: miss ? W.creditMiss($(c.dollars), miss, $(miss * c.dollars)) : W.creditOk($(c.dollars)) });
    break;
  }
  for (const f of p.usageFees.filter((f) => f.dollars > 0)) {
    out.push({ key: "minfee", q: W.minfee(n(f.belowKwh)), why: W.minfeeWhy($(f.dollars), n(f.belowKwh)) });
    break;
  }
  const cond = p.credits.filter((c) => c.conditional);
  if (cond.length) {
    const without = annualCost(p, months, { includeConditional: false }) - annualCost(p, months, { includeConditional: true });
    out.push({ key: "cond", q: W.cond(cond[0].label), why: without > 0.5 ? W.condMore($(Math.round(without))) : W.condTied });
  }
  if (p.termMonths > 0 && p.termMonths <= 6) out.push({ key: "short", q: W.short(p.termMonths), why: W.shortWhy(p.termMonths) });
  if (p.touPeriods.length) {
    const cheap = [...p.touPeriods].sort((a, b) => a.cents - b.cents)[0];
    out.push({ key: "tou", q: W.tou(Math.round(cheap.share * 100), cheap.label), why: W.touWhy });
  }
  const tiers = [...p.energyTiers].sort((a, b) => a.fromKwh - b.fromKwh);
  if (tiers.length > 1) {
    const jump = tiers.find((t, i) => i > 0 && t.cents > tiers[i - 1].cents);
    if (jump) out.push({ key: "tier", q: W.tier(n(jump.fromKwh)), why: W.tierWhy(jump.cents, tiers[tiers.indexOf(jump) - 1].cents) });
  }
  for (const f of p.amortizedFees) {
    out.push({ key: "setup", q: W.setup($(f.dollars), f.label), why: W.setupWhy(f.months) });
    break;
  }
  if (p.earlyTerminationFee.dollars > 0) {
    const etf = p.earlyTerminationFee;
    out.push({ key: "exit", q: W.exit, why: etf.perMonthRemaining ? W.exitPer($(etf.dollars)) : W.exitFlat($(etf.dollars)) });
  }
  return out.slice(0, max);
}
