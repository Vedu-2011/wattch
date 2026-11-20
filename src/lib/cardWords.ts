import { LIST_DATE } from "./listDate";
/** Words on the share cards (/api/card), English and Spanish. Numbers are filled in by code. */
export const CARD_WORDS = {
  en: { mine: "My own 12 months", perMonth: (k: string) => `${k} kWh a month`, filtered: " · filtered", more: `more a year on the plan the state site listed first on ${LIST_DATE.en}.`, best: "My best plan", my1: (n: string, d: string) => `My #1: ${n} · ${d}/yr`,
    advertised: (c: number) => `Advertised at ${c}¢ — really`, perYear: "/yr", rankOf: (i: number, n: number) => `#${i} of ${n} plans for this home`, vsBest: (d: string) => `${d} a year more than the best plan`, isBest: "The cheapest plan for this home", nearBest: "about the same as the best plan",
    saves: (d: string) => `saves ${d} a year`, sameCost: "Same yearly cost", over: (n: string) => `over ${n}` },
  es: { mine: "Mis propios 12 meses", perMonth: (k: string) => `${k} kWh al mes`, filtered: " · con filtros", more: `más al año con el plan que el sitio del estado mostraba primero el ${LIST_DATE.es}.`, best: "Mi mejor plan", my1: (n: string, d: string) => `Mi #1: ${n} · ${d}/año`,
    advertised: (c: number) => `Anunciado a ${c}¢ — en realidad`, perYear: "/año", rankOf: (i: number, n: number) => `#${i} de ${n} planes para este hogar`, vsBest: (d: string) => `${d} al año más que el mejor plan`, isBest: "El plan más barato para este hogar", nearBest: "casi lo mismo que el mejor plan",
    saves: (d: string) => `ahorra ${d} al año`, sameCost: "El mismo costo al año", over: (n: string) => `frente a ${n}` },
} as const;
