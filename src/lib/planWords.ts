import type { BillLine } from "@/lib/bill";
import type { Lang } from "@/lib/i18n";

/** Every fixed string on /plan/[id], in English and Spanish. Plan, provider and fee names stay as the label prints them. */
export const PLAN_WORDS = {
  en: {
    all: "← All plans",
    months: (m: number) => `${m} months`,
    renewable: (pct: number) => `${pct}% renewable`,
    checkTitle: "Does our math match the label?",
    usage: "Usage", says: "Label says", ours: "We get", match: "Match",
    verified: "Verified: all 3 label prices rebuilt within a tenth of a cent.",
    notVerified: (m: string) => `Not verified: ${m} We don't rank this plan.`,
    fetched: (when: string) => `Fine print fetched ${when} CT (`,
    viaAnakin: "through Anakin.io (the page needed a real browser)",
    viaDirect: "straight from the provider",
    readBy: (who: string) => (who.startsWith("hand-read") ? who : `read by ${who}`),
    original: "Open the original label",
    billAt: "Your bill at",
    total: "Total",
    fpTitle: "The fine print, with every number we used",
    fpFound: "numbers found on the label",
    yellow: "Yellow", yellowIs: "= a number the bill math uses.",
    green: "Green", greenIs: "= the 3 averages our check rebuilds.",
    hoverHint: "Hover or tap a bill line or a check row to find its number here.",
    langNote: "",
    tduFilled: (u: string) => `This label doesn't print delivery charges, so those come from ${u}'s and don't light up.`,
    formFields: "This label keeps its prices in PDF form fields, so the text below runs them together and few can be marked.",
    exact: (anakin: boolean) => `The text exactly as Wattch read it from the label (${anakin ? "opened through Anakin.io" : "the provider's PDF"}). Marks are found by code, not by AI.`,
    yearTitle: "Your year on this plan",
    perYr: "/yr",
    mine: "Your own 12 months, as you typed them.",
    shaped: (k: string, city: string, dallas: boolean) =>
      `Averaging ${k} kWh, shaped like a real ${city} year (${dallas ? "most in summer, more in winter too, least in spring and fall" : "more in summer, less in winter and spring"}).`,
    flat: (k: string) => `${k} kWh every month.`,
    toFlat: "Show same usage every month",
    toSeasons: (city: string) => `Use ${city} seasons`,
    why: "Why?",
    creditNeeds: (k: string) => `credit needs ${k} kWh`,
    askTitle: "Ask yourself before you sign",
    remind: "Set a reminder",
    askBy: "Written by code from this plan's label and your 12 months.",
    curveTitle: "Bill at every usage",
    curveHint: "Hover or tap the chart. Red bands are price cliffs.",
    notesTitle: "Things the fine print says",
    notesBy: "Written by the AI reader. The math above never uses these notes.",
    printed: (id: string, when: string) => `Printed from Wattch (getwattch.vercel.app/plan/${id}). Prices before taxes, from the plan's own fine-print label read ${when} CT.`,
    originalLabel: "Original label:",
  },
  es: {
    all: "← Todos los planes",
    months: (m: number) => `${m} meses`,
    renewable: (pct: number) => `${pct}% renovable`,
    checkTitle: "¿Nuestras cuentas dan lo mismo que la etiqueta?",
    usage: "Consumo", says: "La etiqueta dice", ours: "Nos da", match: "Coincide",
    verified: "Verificado: rehicimos los 3 precios de la etiqueta con menos de una décima de centavo de diferencia.",
    notVerified: (m: string) => `Sin verificar: ${m} No ponemos este plan en la lista.`,
    fetched: (when: string) => `Letra pequeña descargada el ${when} CT (`,
    viaAnakin: "con Anakin.io (la página necesitaba un navegador real)",
    viaDirect: "directo del proveedor",
    readBy: (who: string) => (who.startsWith("hand-read") ? who : `leída por ${who}`),
    original: "Abrir la etiqueta original",
    billAt: "Tu factura con",
    total: "Total",
    fpTitle: "La letra pequeña, con cada número que usamos",
    fpFound: "números encontrados en la etiqueta",
    yellow: "Amarillo", yellowIs: "= un número que usa la cuenta de la factura.",
    green: "Verde", greenIs: "= los 3 promedios que nuestra revisión rehace.",
    hoverHint: "Pasa el cursor o toca una línea de la factura o de la revisión para encontrar su número aquí.",
    langNote: "La etiqueta está en inglés, tal como la publica el proveedor.",
    tduFilled: (u: string) => `Esta etiqueta no imprime los cargos de entrega, así que usamos los de ${u} y no se marcan.`,
    formFields: "Esta etiqueta guarda sus precios en campos de formulario del PDF, así que el texto los junta y se pueden marcar pocos.",
    exact: (anakin: boolean) => `El texto tal como Wattch lo leyó de la etiqueta (${anakin ? "abierta con Anakin.io" : "el PDF del proveedor"}). Las marcas las pone el código, no la IA.`,
    yearTitle: "Tu año con este plan",
    perYr: "/año",
    mine: "Tus propios 12 meses, como los escribiste.",
    shaped: (k: string, city: string, dallas: boolean) =>
      `Un promedio de ${k} kWh, repartido como un año real en ${city} (${dallas ? "más en verano, también más en invierno, menos en primavera y otoño" : "más en verano, menos en invierno y primavera"}).`,
    flat: (k: string) => `${k} kWh todos los meses.`,
    toFlat: "Mostrar el mismo consumo cada mes",
    toSeasons: (city: string) => `Usar las temporadas de ${city}`,
    why: "¿Por qué?",
    creditNeeds: (k: string) => `el crédito pide ${k} kWh`,
    askTitle: "Pregúntate antes de firmar",
    remind: "Poner un recordatorio",
    askBy: "Escrito por el código a partir de la etiqueta de este plan y tus 12 meses.",
    curveTitle: "La factura con cualquier consumo",
    curveHint: "Pasa el cursor o toca la gráfica. Las franjas rojas son saltos de precio.",
    notesTitle: "Lo que dice la letra pequeña",
    notesBy: "Escrito por el lector de IA, en inglés. Las cuentas de arriba nunca usan estas notas.",
    printed: (id: string, when: string) => `Impreso desde Wattch (getwattch.vercel.app/plan/${id}). Precios antes de impuestos, de la etiqueta del plan leída el ${when} CT.`,
    originalLabel: "Etiqueta original:",
  },
} as const;

const LINE_ES: Record<string, string> = {
  energy: "Cargo por energía", base: "Cargo base", tduKwh: "Entrega por kWh", tduMonthly: "Cargo mensual de entrega",
};

/** A bill line's name in the page's language. Fixed lines are translated; fee and credit names stay as the label prints them. */
export function lineLabel(l: BillLine, lang: Lang): string {
  if (lang !== "es") return l.label;
  if (LINE_ES[l.key]) return LINE_ES[l.key];
  if (l.key.startsWith("amort-")) return l.label.replace(/\(spread over (\d+) mo\)$/, "(repartido en $1 meses)");
  return l.label;
}
