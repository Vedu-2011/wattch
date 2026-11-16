/**
 * English + Spanish words for the core flow (home → pick usage → the wall → the answer).
 * Numbers never live here: every number is still computed by code and dropped into these sentences.
 * Spanish written by Claude Code — have a native speaker read it before the demo.
 */
export type Lang = "en" | "es";
export const LANGS: Lang[] = ["en", "es"];
export const asLang = (v: string | null | undefined): Lang => (v === "es" ? "es" : "en");

/** A sentence split around its numbers (text, n, text, n, text, n, text) so the numbers can be bold. */
type Parts = readonly [string, string, string, string, string, string, string];

const n = (x: number, lang: Lang) => x.toLocaleString(lang === "es" ? "es-US" : "en-US");

export const MONTHS_BY_LANG: Record<Lang, readonly string[]> = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  es: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
};

export const TRAP_LABELS: Record<Lang, Record<string, string>> = {
  en: {},
  es: {
    credit: "Crédito con trampa", minfee: "Cargo por uso mínimo", cliff: "Salto de precio", cond: "Requiere pago automático",
    tier: "Precio por niveles", tou: "Por horario", setup: "Cargo de inicio",
  },
};

const en = {
  // home
  badge: (total: number, date: string) => `${total} Houston plans · fine print read ${date}`,
  heroTitle: "Your power plan's real price is in the fine print.",
  heroBody: "Texas lets you pick your electricity plan, then hides the real price in a PDF. Wattch reads every Houston plan's fine print, checks its own work against the label, and does the honest math at your usage.",
  statRead: "Houston plans read",
  statChecked: "checked against their label",
  statTrap: "with a usage trap",
  stickyCta: "Find my best plan",
  foundInFine: "Found in the fine print",
  carousel: (sticker: string, real: string, over: string): Parts => [`Advertised `, sticker, `. Using 1,100 kWh a month through a Houston year, you'd really pay `, real, ` — `, over, ` more a year.`],
  seeFinePrint: "See the fine print",
  exampleOf: (i: number, total: number) => `Example ${i} of ${total}`,
  // picker
  pickerQ: "How much power do you use in a month?",
  pickerHint: (avg: number) => `It's on your bill as "kWh used." For the best answer, add up the last 12 months from your bill's usage chart and divide by 12. Not sure? The average Texas home uses about ${n(avg, "en")} kWh a month.`,
  presets: ["Small apartment", "Average home", "Big house, hot summer"],
  readEvery: "Read every plan",
  pickerBad: "Pick a number between 100 and 5,000.",
  areaQ: "Where do you live?", areaHouston: "Houston (CenterPoint)", areaDallas: "Dallas–Fort Worth (Oncor)",
  // wall
  wallReading: "Reading the fine print…",
  progressName: "Plans read",
  progressOf: (n: number, total: number) => `${n} of ${total}`,
  wallDone: "Every plan, read.",
  wallIntro: (when: string) => `Each tile is one real Houston plan's fine-print label, read on ${when}. ✓ means our math rebuilt the label's own prices to the tenth of a cent.`,
  counterRead: "read",
  counterChecked: "checked ✓",
  skip: "Skip",
  tileTou: "time-of-use",
  tileCliff: "cliff",
  tileMismatch: "Didn't add up",
  tileUnread: "Couldn't open",
  kwhNote: (note: "low" | "high" | "bad", kwh: number) =>
    note === "bad" ? `That usage didn't look like a number, so this shows an average home (${n(kwh, "en")} kWh). Change it below.`
    : note === "low" ? `That's below the lowest usage Wattch prices, so this starts at ${n(kwh, "en")} kWh. Change it below.`
    : `That's more than ${n(kwh, "en")} kWh, the most Wattch prices, so this uses ${n(kwh, "en")} kWh.`,
  noneTitle: "No plan passes all your filters.",
  noneBody: "Turn one of them off below and the list comes back.",
  youAverage: (kwh: number, mine: boolean) => `You average ${n(kwh, "en")} kWh a month${mine ? " (your own 12 months)" : ""}`,
  tSeasons: "Houston seasons", tSeasonsHint: "August ≈ 2.6× February",
  tLocked: "Price locked 12+ months", tNoCliffs: "No bill-credit traps", tGreen: "50%+ renewable",
  tRated: "4+ stars", tRatedHint: "Power to Choose rating", tAutopay: "Count autopay discounts",
  monthPrice: (m: number) => `${m}-month price`,
  perYear: "/yr",
  compareWith1: "Compare with #1 →",
  rankNote: (notRanked: number) => `Yearly cost at today's prices, before taxes. ${notRanked} variable-rate plans aren't ranked: their price can change every month, so a yearly number would be a guess. Prepaid plans and plans we couldn't verify aren't ranked either.`,
  // reveal
  atUsage: (kwh: number, seasons: boolean, mine: boolean) => mine
    ? `With your own 12 months (about ${n(kwh, "en")} kWh a month)`
    : `At ${n(kwh, "en")} kWh a month${seasons ? ", with real Houston seasons" : ", same every month"}`,
  moreAYear: (filtered: boolean) => `more a year — if you pick the plan the state site lists first${filtered ? " (among plans that pass your filters)" : ""}.`,
  stateFirst: (rank: number) => `State site's #1 · #${rank} for you`,
  yourFirst: "Your #1",
  why: "Why?",
  creditNeeds: (kwh: number) => `credit needs ${n(kwh, "en")} kWh`,
  bestTitle: "Your best plan: ",
  bestBody: (provider: string, annual: string) => `${provider} · ${annual} a year. Here it matches the state site's first pick — drag the slider to see where that stops being true.`,
  seeMath: "See the math",
  openFirst: "Open the #1 plan's fine print",
  sideBySide: "Side by side",
  surpriseEyebrow: "Biggest gap between sticker and real price",
  surpriseBody: (sticker: string, real: string, over: string): Parts => [`Advertised at `, sticker, ` per kWh. Over your year you'd really pay `, real, ` — `, over, ` more than the sticker price suggests.`],
  showWhy: "Show me why",
  sticker: "sticker", real: "real",
  shareGap: (gap: string) => `The state site's #1 power plan would cost me ${gap} more a year than my best plan. Wattch read the fine print on every Houston plan:`,
  shareBest: "Wattch read the fine print on every Houston power plan and found my best one:",
  shareMine: "Share my result", shareCard: "Share card", linkCopied: "Link copied",
  shareFailed: "Couldn't share — copy the address bar instead",
  usageByMonth: "Your usage by month",
  monthsUnder: (k: number, line: number) => `${k} ${k === 1 ? "month" : "months"} under ${n(line, "en")} kWh`,
  switchTo: "Español",
};

export type Words = typeof en;

const es: Words = {
  badge: (total, date) => `${total} planes de Houston · letra pequeña leída el ${date}`,
  heroTitle: "El precio real de tu plan de luz está en la letra pequeña.",
  heroBody: "Texas te deja escoger tu plan de electricidad, pero esconde el precio real en un PDF. Wattch lee la letra pequeña de cada plan de Houston, revisa su propio trabajo contra la etiqueta y hace las cuentas honestas con tu consumo.",
  statRead: "planes de Houston leídos",
  statChecked: "revisados contra su etiqueta",
  statTrap: "con una trampa de consumo",
  stickyCta: "Encontrar mi mejor plan",
  foundInFine: "Encontrado en la letra pequeña",
  carousel: (sticker, real, over) => [`Anunciado a `, sticker, `. Usando 1,100 kWh al mes durante un año en Houston, en realidad pagarías `, real, ` — `, over, ` más al año.`],
  seeFinePrint: "Ver la letra pequeña",
  exampleOf: (i, total) => `Ejemplo ${i} de ${total}`,
  pickerQ: "¿Cuánta luz usas al mes?",
  pickerHint: (avg) => `Aparece en tu factura como "kWh usados". Para la mejor respuesta, suma los últimos 12 meses de la gráfica de consumo de tu factura y divide entre 12. ¿No sabes? Un hogar promedio en Texas usa unos ${n(avg, "es")} kWh al mes.`,
  presets: ["Apartamento pequeño", "Casa promedio", "Casa grande, verano caluroso"],
  readEvery: "Leer todos los planes",
  pickerBad: "Escoge un número entre 100 y 5,000.",
  areaQ: "¿Dónde vives?", areaHouston: "Houston (CenterPoint)", areaDallas: "Dallas–Fort Worth (Oncor)",
  wallReading: "Leyendo la letra pequeña…",
  progressName: "Planes leídos",
  progressOf: (n, total) => `${n} de ${total}`,
  wallDone: "Todos los planes, leídos.",
  wallIntro: (when) => `Cada cuadro es la etiqueta de un plan real de Houston, leída el ${when}. ✓ quiere decir que nuestras cuentas reconstruyeron los precios de la propia etiqueta, al décimo de centavo.`,
  counterRead: "leídos",
  counterChecked: "revisados ✓",
  skip: "Saltar",
  tileTou: "por horario",
  tileCliff: "trampa",
  tileMismatch: "No cuadró",
  tileUnread: "No se pudo abrir",
  kwhNote: (note, kwh) =>
    note === "bad" ? `Ese consumo no parecía un número, así que esto muestra un hogar promedio (${n(kwh, "es")} kWh). Cámbialo abajo.`
    : note === "low" ? `Eso está por debajo del mínimo que Wattch calcula, así que empieza en ${n(kwh, "es")} kWh. Cámbialo abajo.`
    : `Eso es más de ${n(kwh, "es")} kWh, lo máximo que Wattch calcula, así que usa ${n(kwh, "es")} kWh.`,
  noneTitle: "Ningún plan pasa todos tus filtros.",
  noneBody: "Quita uno abajo y la lista vuelve.",
  youAverage: (kwh, mine) => `Usas en promedio ${n(kwh, "es")} kWh al mes${mine ? " (tus propios 12 meses)" : ""}`,
  tSeasons: "Temporadas de Houston", tSeasonsHint: "agosto ≈ 2.6× febrero",
  tLocked: "Precio fijo 12+ meses", tNoCliffs: "Sin créditos con trampa", tGreen: "50%+ renovable",
  tRated: "4+ estrellas", tRatedHint: "calificación de Power to Choose", tAutopay: "Contar descuentos por pago automático",
  monthPrice: (m) => (m === 1 ? "precio por 1 mes" : `precio por ${m} meses`),
  perYear: "/año",
  compareWith1: "Comparar con el #1 →",
  rankNote: (notRanked) => `Costo anual a precios de hoy, sin impuestos. ${notRanked} planes de tarifa variable no están en la lista: su precio puede cambiar cada mes, así que un número anual sería adivinar. Los planes prepagados y los que no pudimos verificar tampoco.`,
  atUsage: (kwh, seasons, mine) => mine
    ? `Con tus propios 12 meses (unos ${n(kwh, "es")} kWh al mes)`
    : `Con ${n(kwh, "es")} kWh al mes${seasons ? ", con las temporadas reales de Houston" : ", igual cada mes"}`,
  moreAYear: (filtered) => `más al año — si escoges el plan que el sitio del estado pone primero${filtered ? " (entre los planes que pasan tus filtros)" : ""}.`,
  stateFirst: (rank) => `#1 del sitio del estado · #${rank} para ti`,
  yourFirst: "Tu #1",
  why: "¿Por qué?",
  creditNeeds: (kwh) => `el crédito pide ${n(kwh, "es")} kWh`,
  bestTitle: "Tu mejor plan: ",
  bestBody: (provider, annual) => `${provider} · ${annual} al año. Aquí coincide con la primera opción del sitio del estado — mueve la barra para ver dónde deja de ser cierto.`,
  seeMath: "Ver las cuentas",
  openFirst: "Abrir la letra pequeña del #1",
  sideBySide: "Lado a lado",
  surpriseEyebrow: "La mayor diferencia entre el precio anunciado y el real",
  surpriseBody: (sticker, real, over) => [`Anunciado a `, sticker, ` por kWh. En tu año pagarías en realidad `, real, ` — `, over, ` más de lo que sugiere el precio anunciado.`],
  showWhy: "Muéstrame por qué",
  sticker: "anunciado", real: "real",
  shareGap: (gap) => `El plan #1 del sitio del estado me costaría ${gap} más al año que mi mejor plan. Wattch leyó la letra pequeña de cada plan de Houston:`,
  shareBest: "Wattch leyó la letra pequeña de cada plan de luz de Houston y encontró el mejor para mí:",
  shareMine: "Compartir mi resultado", shareCard: "Tarjeta para compartir", linkCopied: "Enlace copiado",
  shareFailed: "No se pudo compartir — copia la dirección de la barra",
  usageByMonth: "Tu consumo por mes",
  monthsUnder: (k, line) => `${k} ${k === 1 ? "mes" : "meses"} por debajo de ${n(line, "es")} kWh`,
  switchTo: "English",
};

export const WORDS: Record<Lang, Words> = { en, es };

/**
 * Words for one area. Every "Houston" in the dictionary means the place, so other areas swap the city name in;
 * the season hint is the one number that differs (Dallas: Aug 1.53 ÷ Feb 0.85 ≈ 1.8×, and winter is high too —
 * data/seasons-dallas.json).
 */
export function words(lang: Lang, area: "houston" | "dallas" = "houston"): Words {
  const w = WORDS[lang];
  if (area === "houston") return w;
  const city = "Dallas–Fort Worth";
  const swap = (s: string) => s.replaceAll("Houston", city);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(w)) {
    if (typeof v === "string") out[k] = swap(v);
    else if (typeof v === "function") out[k] = (...a: unknown[]) => { const r = (v as (...x: unknown[]) => unknown)(...a); return typeof r === "string" ? swap(r) : Array.isArray(r) ? r.map((x) => (typeof x === "string" ? swap(x) : x)) : r; };
    else if (Array.isArray(v)) out[k] = v.map((x) => (typeof x === "string" ? swap(x) : x));
  }
  out.tSeasonsHint = lang === "es" ? "agosto ≈ 1.8× febrero; enero también alto" : "August ≈ 1.8× February; January runs high too";
  return out as Words;
}
