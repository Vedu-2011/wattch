/**
 * /sources in English and Spanish. Source names stay as their publishers wrote them (shown with lang="en");
 * who published it and what Wattch uses it for are translated. Every number here is in docs/SOURCES.md.
 */
export const SOURCE_LINKS = [
  { name: "Power to Choose — plan list (CSV export)", url: "https://www.powertochoose.org/en-us/Plan/ExportToCsv" },
  { name: "16 Tex. Admin. Code § 25.475 — Electricity Facts Label rules", url: "https://www.law.cornell.edu/regulations/texas/16-Tex-Admin-Code-SS-25-475" },
  { name: "Backcasted (Actual) Load Profiles, 2023–2025", url: "https://www.ercot.com/mktinfo/loadprofile/alp" },
  { name: "Profile Type Counts (Nov 2, 2026 file)", url: "https://www.ercot.com/mktinfo/loadprofile" },
  { name: "Form EIA-861M — monthly sales and customers (sales_revenue.xlsx)", url: "https://www.eia.gov/electricity/data/eia861m/" },
  { name: "Anakin.io URL Scraper", url: "https://anakin.io" },
  { name: "Each plan's Electricity Facts Label", url: "" },
] as const;

export const SOURCES_WORDS = {
  en: {
    title: "Wattch — sources",
    desc: "Where every number in Wattch comes from: Power to Choose, each plan's fine-print label, ERCOT load profiles and EIA.",
    h1: "Sources",
    intro: "Every number in Wattch comes from one of these.",
    items: [
      { by: "Public Utility Commission of Texas", use: "Every Houston (CenterPoint) and Dallas–Fort Worth (Oncor) plan, its fine-print link, and the prices the state site shows. Checked again for free on Nov 19, 2026: plans that have left it are marked and not ranked." },
      { by: "Texas Administrative Code (via Cornell LII)", use: "Why every label prints average prices at 500, 1,000 and 2,000 kWh — the numbers our check rebuilds." },
      { by: "ERCOT (the Texas grid operator)", use: "The season shapes. ERCOT's 15-minute residential profiles, added up by calendar month. Houston uses the Coast weather zone: August ≈ 1.63× the yearly average, February ≈ 0.63×. Dallas–Fort Worth uses the North Central zone: August ≈ 1.53×, February ≈ 0.85×, January ≈ 1.12×. A profile is ERCOT's modeled average home of one type, not one real meter." },
      { by: "ERCOT", use: "How many homes ERCOT puts in each home type, used to mix the two profiles. CenterPoint: 1,868,817 \"low winter\" (RESLOWR) and 650,559 \"high winter\" (RESHIWR, which use more in winter). Oncor, North Central: 947,346 low winter and 1,745,928 high winter — that's why Dallas–Fort Worth's January runs high." },
      { by: "U.S. Energy Information Administration", use: "The average Texas home uses about 1,117 kWh a month (residential sales ÷ customers, 2023–2025) — the hint on the home page. Its statewide month shape (August ≈ 1.46×) was Wattch's first season model; the ERCOT ones above replaced it." },
      { by: "Anakin.io (Triple H sponsor)", use: "Opens fine-print pages that need a real browser or block plain downloads." },
      { by: "The plan's provider", use: "Linked from every plan page. This is what the AI reads." },
    ],
  },
  es: {
    title: "Wattch — fuentes",
    desc: "De dónde sale cada número de Wattch: Power to Choose, la etiqueta de cada plan, los perfiles de carga de ERCOT y la EIA.",
    h1: "Fuentes",
    intro: "Cada número de Wattch sale de una de estas fuentes. Los nombres quedan como los publicó cada fuente, en inglés.",
    items: [
      { by: "Comisión de Servicios Públicos de Texas (PUCT)", use: "Cada plan de Houston (CenterPoint) y de Dallas–Fort Worth (Oncor), el enlace a su letra pequeña y los precios que muestra el sitio del estado. Revisada otra vez, gratis, el 19 de noviembre de 2026: los planes que salieron de ella se marcan y no entran en la lista." },
      { by: "Código Administrativo de Texas (vía Cornell LII)", use: "Por qué cada etiqueta imprime precios promedio con 500, 1,000 y 2,000 kWh: los números que nuestra revisión rehace." },
      { by: "ERCOT (el operador de la red eléctrica de Texas)", use: "La forma de las temporadas. Los perfiles residenciales de ERCOT cada 15 minutos, sumados por mes. Houston usa la zona Coast: agosto ≈ 1.63 veces el promedio del año, febrero ≈ 0.63. Dallas–Fort Worth usa la zona North Central: agosto ≈ 1.53, febrero ≈ 0.85, enero ≈ 1.12. Un perfil es la casa promedio de un tipo según el modelo de ERCOT, no un medidor real." },
      { by: "ERCOT", use: "Cuántas casas pone ERCOT en cada tipo, para mezclar los dos perfiles. CenterPoint: 1,868,817 de \"invierno bajo\" (RESLOWR) y 650,559 de \"invierno alto\" (RESHIWR, que usan más en invierno). Oncor, North Central: 947,346 de invierno bajo y 1,745,928 de invierno alto; por eso enero sale alto en Dallas–Fort Worth." },
      { by: "Administración de Información Energética de EE. UU. (EIA)", use: "La casa promedio de Texas usa unos 1,117 kWh al mes (ventas residenciales ÷ clientes, 2023–2025): la pista en la página de inicio. Su forma por mes para todo el estado (agosto ≈ 1.46) fue el primer modelo de temporadas de Wattch; los de ERCOT de arriba lo reemplazaron." },
      { by: "Anakin.io (patrocinador de Triple H)", use: "Abre las páginas de letra pequeña que necesitan un navegador real o bloquean las descargas." },
      { by: "El proveedor del plan", use: "Enlazada desde cada página de plan. Es lo que lee la IA." },
    ],
  },
} as const;
